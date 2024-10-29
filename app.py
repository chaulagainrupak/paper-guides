import os
from dotenv import load_dotenv
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from datetime import datetime
import base64

# We are importing all the required functions from the following files inorder to make a huge app file?

# Not the best way to put everything in one single file but, whaterver
from paperGuidesDB import *
from config import *
from logHandler import getCustomLogger

# Load environment variables from .env file

load_dotenv('.env')

app = Flask(__name__)

# Replace hardcoded values with environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', default=False)


db.init_app(app)

# Initialize custom logger
logger = getCustomLogger(__name__)

# path for the config
configPath = './configs/config.json'


# Initialize Flask-Login
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.before_request
def setup():
    # Create tables only once before the first request is processed
    with app.app_context():
        db.create_all()  # Ensure tables are created
        createDatabase()  # If needed, call additional setup functions

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    logger.info('Home page accessed', extra={'http_request': True})
    return render_template('index.html')


"""
These routes handle the question papers list and link all the questions in a neat way

allows papole that run wget / curl to spider the site easily and get the data

Maybe in the future there will be a API endpoint to get the data or maybe even database dump torrent?

This part may not require rewrites
"""

@app.route('/levels')
def getLevels():
    logger.info('Levels page accessed', extra={'http_request': True})
    config = loadConfig(configPath)
    return render_template('levels.html',config=config )

@app.route('/subjects/<int:level>')
def getLevelSubjects(level):
    logger.info(f'Subjects page accessed for level {level}', extra={'http_request': True})
    config = loadConfig(configPath)
    return render_template('subject.html', config = config, level = level)


@app.route('/subjects/<int:level>/<subject_name>')
def getSubjectYears(level, subject_name):
    logger.info(f'Years page accessed for level {level}, subject {subject_name}', extra={'http_request': True})
    years = getYears(level,subject_name)
    return render_template('years.html', subject_name = subject_name, level = level, years = years)


@app.route('/subjects/<int:level>/<subject_name>/<int:year>')
def getSubjectQuestions(level ,subject_name, year):
    logger.info(f'Questions page accessed for level {level}, subject {subject_name}, year {year}', extra={'http_request': True})
    question_name = getQuestions(level, subject_name, year)
    return render_template('questions.html', questions_name = question_name, year = year)


@app.route('/subjects/<int:level>/<subject_name>/<int:year>/<file_data>')
def renderSubjectQuestion(level ,subject_name, year, file_data):
    logger.info(f'Question rendered for level {level}, subject {subject_name}, year {year}, file {file_data}', extra={'http_request': True})
    component  = file_data.split(', ')

    component = component[1]
    question  = renderQuestion(level, subject_name, year, component)
    return render_template('qp.html', question = question[0], file_data = file_data, id = question[1][0][0]) # we are extracting the id from the tuple in a array that is in the main array.


# Reders the about page. Duh

@app.route('/about')
def about():
    logger.info('About page accessed', extra={'http_request': True})
    return render_template('about.html')



# This is the route to the question genreation page where the user selects their desired questions

@app.route('/question-generator')
def questionGenerator():
    logger.info('Question generator page accessed', extra={'http_request': True})
    config = loadConfig(configPath)
    return render_template('question-generator.html', config = config)

# This route displays the questions the uppper route genetated a diffrent page and route

@app.route('/question-gen', methods=['POST', 'GET'])
def questionGen():
    logger.info('Question generation initiated', extra={'http_request': True})
    if request.method == 'POST':
        try:
            # Extract form data
            subject = request.form.get('subject')
            level = request.form.get('level')
            topics = request.form.getlist('topic')
            difficulties = request.form.getlist('difficulty')
            components = request.form.getlist('component')

            # Convert lists to correct format for SQL placeholders
            # No need to add single quotes around list items here
            # Example: ['Algebra', 'Geometry'] stays as is
            # Example: ['1', '2', '3'] stays as is

            # Convert components to correct format for SQL placeholders
            if 'ALL' in components:
                components = 'ALL'
            else:
                components = [component for component in components]

            # Call the getQuestions function
            rows = getQuestionsForGen(subject, level, topics, components, difficulties)
            return render_template('qpgen.html', rows = rows)  # Return results to the client

        except Exception as e:
            logger.error(f'Error in question generation: {str(e)}', extra={'http_request': True})
            return f"Some error occurred server-side, no reason to panic. Error: {e}", 500


@app.route('/submit')
def submit():
    logger.info('Submit page accessed', extra={'http_request': True})
    config = loadConfig(configPath)

    return render_template('submit.html', config = config)


@app.route('/model-questions')
def modelQuestions():
    logger.info('Model questions page accessed', extra={'http_request': True})
    return render_template('model-questions.html')

@app.route('/support')
def support():
    logger.info('Support page accessed', extra={'http_request': True})
    return render_template('support.html')

@app.route('/contact')
def contact():
    logger.info('Contact page accessed', extra={'http_request': True})
    return render_template('contact.html')



@app.route('/submitQuestion', methods=['POST'])
@login_required
def submitQuestion():
    logger.info('Question submission initiated', extra={'http_request': True})
    board = request.form.get('board')
    subject = request.form.get('subject')
    topic = request.form.get('topic')
    difficulty = request.form.get('difficulty')
    level = request.form.get('level')
    component = request.form.get('component')
    questionFile = request.files['questionFile'].read()
    solutionFile = request.files['solutionFile'].read()


    if insertQuestion(board, subject, topic, difficulty, level, component, questionFile, solutionFile):
        logger.info('Question submitted successfully', extra={'http_request': True})
        return redirect(url_for('index'))
    else:
        logger.error('Error occurred while submitting question', extra={'http_request': True})
        return "Error occurred while submitting question", 500

@app.route('/submitPaper', methods=['POST'])
@login_required
def submitPaper():
    logger.info('Paper submission initiated', extra={'http_request': True})
    try:
        board = request.form.get('board')
        subject = request.form.get('subject')
        year = request.form.get('year')
        level = request.form.get('level')
        component = request.form.get('component')
        questionFile = request.files['questionFile'].read()
        solutionFile = request.files['solutionFile'].read()


        paper_type = request.form.get('paper_type')


        if not all([board, subject, level, component, questionFile, paper_type]):
            raise ValueError("Missing required fields")

        if paper_type == 'yearly':
            if not year:
                raise ValueError("Year is required for yearly papers")
            result = insertPaper(board, subject, year, level, component, questionFile, solutionFile)
        elif paper_type == 'topical':
            result = insertTopical(board, subject, questionFile, solutionFile)
        else:
            raise ValueError(f"Invalid paper type: {paper_type}")

        if result:
            logger.info('Paper submitted successfully', extra={'http_request': True})
            return redirect(url_for('index'))
        else:
            raise Exception("Insert operation failed")

    except Exception as e:
        logger.error(f'Error in paper submission: {str(e)}', extra={'http_request': True})
        print(f"Error in submitPaper: {str(e)}")  # Debug print
        return f"Error occurred while submitting paper: {str(e)}", 500



"""
This functionality for the user login and authentication will be implemented later so this part of the code has been commented.

This allows for more functionalities for uploading user submitted data and allowing users to post ratings for the questions.

"""


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username_or_email = request.form.get('username')
        password = request.form.get('password')

        # Check if input is an email
        if '@' in username_or_email:
            user = User.query.filter_by(email=username_or_email).first()
        else:
            user = User.query.filter_by(username=username_or_email).first()

        # Check if user exists and the password matches
        if user and check_password_hash(user.password, password):
            login_user(user)
            logger.info(f'User {user.username} logged in', extra={'http_request': True})
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            logger.warning(f'Failed login attempt for {username_or_email}', extra={'http_request': True})
            flash('Login unsuccessful. Please check your credentials.', 'danger')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('new-username')
        password = request.form.get('new-password')
        email = request.form.get('new-email')

        # Check if username or email already exists
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Username or email already exists. Please choose another.', 'danger')
        else:
            # Hash the password before storing it
            hashed_password = generate_password_hash(password)

            # Create new user with hashed password
            new_user = User(username=username, password=hashed_password, email=email)
            db.session.add(new_user)
            db.session.commit()

            flash('Account created successfully! You can now log in.', 'success')
            return redirect(url_for('login'))

    return render_template('signup.html')


# Will profiles even be a thing ? Public IDK but chaning the email password will be implemented

# @app.route('/profile')
# @login_required
# def profile():
#     return render_template('profile.html')


@app.route('/rate/<question_UUID>/<int:rating>', methods = ['POST'])
@login_required
def rate(question_UUID, rating):
    try:
        user = current_user.id
        if giveRating(user, question_UUID, rating):
            logger.info(f'User {user} rated question {question_UUID} with {rating}', extra={'http_request': True})
            return True
        else:
            logger.warning(f'Failed to rate question {question_UUID}', extra={'http_request': True})
            return False
    except Exception as e:
        logger.error(f'Error in rating: {str(e)}', extra={'http_request': True})
        print(f'Something went wrong while giving a rating: {e}')
        return False



# Update /admin route to send only UUIDs and hashes

@app.route('/admin')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        logger.warning(f'Unauthorized access attempt by user: {current_user.username}')
        return redirect(url_for('index'))

    try:
        questions = get_unapproved_questions()
        papers = get_unapproved_papers()

        data = {
            "questions": [],
            "papers": []
        }

        for question in questions:
            data["questions"].append({
                "id": question["id"],
                "uuid": question["uuid"],
                "questionFileHash": getHash(question["questionFile"]),
                "solutionFileHash": getHash(question["solutionFile"]),
                "questionBlob": "none",
                "solutionBlob": "none",
            })

        for paper in papers:
            data["papers"].append({
                "id": paper["id"],
                "uuid": paper["uuid"],
                "questionFileHash": getHash(paper["questionFile"]),
                "solutionFileHash": getHash(paper["solutionFile"]),
                "questionBlob": "none",
                "solutionBlob": "none",
            })

        logger.info('Data sent to the admin page successfully')
        return render_template('admin.html', data=data)

    except Exception as e:
        logger.error(f'Error retrieving unapproved questions or papers: {e}')
        return render_template('admin.html', data={"error": "An error occurred while retrieving data."})


@app.route('/getNewData', methods=["POST"])
@login_required
def getNewData():
    if current_user.role != 'admin':
        logger.warning(f'Unauthorized access attempt by user: {current_user.username}')
        return redirect(url_for('index'))

    try:
        received_data = request.get_json()
        logger.info(f'Server received the following data: {received_data}')

        if received_data.get('message') == 'all':
            questions = get_unapproved_questions()
            papers = get_unapproved_papers()

            data = {
                "questions": [],
                "papers": []
            }

            for question in questions:
                data["questions"].append({
                    "id": question["id"],
                    "uuid": question["uuid"],
                    "subject": question["subject"],
                    "topic": question["topic"],
                    "difficulty": question["difficulty"],
                    "board": question["board"],
                    "level": question["level"],
                    "component": question["component"],
                    "questionFileHash": getHash(question["questionFile"]),
                    "solutionFileHash": getHash(question["solutionFile"]),
                    "questionBlob": question["questionFile"],
                    "solutionBlob": question["solutionFile"],
                })

            for paper in papers:
                data["papers"].append({
                    "id": paper["id"],
                    "uuid": paper["uuid"],
                    "subject": paper["subject"],
                    "year": paper["year"],
                    "board": paper["board"],
                    "level": paper["level"],
                    "component": paper["component"],
                    "questionFileHash": getHash(paper["questionFile"]),
                    "solutionFileHash": getHash(paper["solutionFile"]),
                    "questionBlob": paper["questionFile"],
                    "solutionBlob": paper["solutionFile"],
                })

            return jsonify(data)

        else:
            questions = get_unapproved_questions()
            papers = get_unapproved_papers()

            data = {
                "questions": [],
                "papers": []
            }

            for hash_value in received_data["hashes"]:
                for question in questions:
                    if hash_value == getHash(question["questionFile"]):
                        data["questions"].append({
                            "id": question["id"],
                            "uuid": question["uuid"],
                            "subject": question["subject"],
                            "topic": question["topic"],
                            "difficulty": question["difficulty"],
                            "board": question["board"],
                            "level": question["level"],
                            "component": question["component"],
                            "questionFileHash": getHash(question["questionFile"]),
                            "solutionFileHash": getHash(question["solutionFile"]),
                            "questionBlob": question["questionFile"],
                            "solutionBlob": question["solutionFile"],
                        })
                        break
                for paper in papers:
                    if hash_value == getHash(paper["questionFile"]):
                        data["papers"].append({
                            "id": paper["id"],
                            "uuid": paper["uuid"],
                            "subject": paper["subject"],
                            "year": paper["year"],
                            "board": paper["board"],
                            "level": paper["level"],
                            "component": paper["component"],
                            "questionFileHash": getHash(paper["questionFile"]),
                            "solutionFileHash": getHash(paper["solutionFile"]),
                            "questionBlob": paper["questionFile"],
                            "solutionBlob": paper["solutionFile"],
                        })
                        break

            return jsonify(data)

    except Exception as e:
        logger.error(f'Error processing getNewData: {e}')
        return jsonify({"error": "An error occurred while processing the request."}),

@app.route('/approve_question/<uuid>' , methods=["POST"])
@login_required
def approve(uuid):
    if current_user.role != 'admin':
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    if approve_question(uuid):
        return jsonify({"succss": "Your request was processed successfully"})
    else:
        return jsonify({"erroe": "Your request was not processed successfully"})
    return redirect(url_for('admin_dashboard'))

@app.route('/approve_paper/<uuid>', methods=["POST"])
@login_required
def approvePaper(uuid):
    if current_user.role != 'admin':
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    if approve_paper(uuid):
        return jsonify({"succss": "Your request was processed successfully"})
    else:
        return jsonify({"erroe": "Your request was not processed successfully"})
    return redirect(url_for('admin_dashboard'))

@app.route('/delete_question/<uuid>', methods=["POST"])
@login_required
def deleteQuestion(uuid):
    if current_user.role != 'admin':
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    if delete_question(uuid):
        flash('Question deleted successfully!')
    else:
        flash('Error deleting question', 'error')
    return redirect(url_for('admin_dashboard'))

@app.route('/delete_paper/<uuid>', methods=["POST"])
@login_required
def deletePaper(uuid):
    if current_user.role != 'admin':
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    if delete_paper(uuid):
        flash('Paper deleted successfully!')
    else:
        flash('Error deleting paper', 'error')
    return redirect(url_for('admin_dashboard'))

@app.route('/edit_question/<uuid>', methods=['GET', 'POST'])
@login_required
def editQuestion    (uuid):
    if current_user.role != 'admin':
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    if request.method == 'POST':
        data = {
            'subject': request.form['subject'],
            'topic': request.form['topic'],
            'difficulty': request.form['difficulty'],
            'board': request.form['board'],
            'level': request.form['level'],
            'component': request.form['component']
        }

        if update_question(uuid, data):
            flash('Question updated successfully!')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Error updating question', 'error')

    question = get_question(uuid)
    if not question:
        flash('Question not found', 'error')
        return redirect(url_for('admin_dashboard'))

    return render_template('admin.html', question=question)



@app.template_filter('b64encode')
def b64encode_filter(s):
    return base64.b64encode(s).decode('utf-8') if s else ''


if __name__ == '__main__':
    app.run(debug=True)

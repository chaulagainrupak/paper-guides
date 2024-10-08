# app.py

from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from models import db, User
from datetime import datetime
import base64
import jsonify


# We are importing all the required functions from the following files inorder to make a huge app file?

# Not the best way to put everything in one single file but, whaterver
from paperGuidesDB import *
from config import *
from logHandler import getCustomLogger


# This needs to be replaced using a .env file for but current building and testing hardcoded non-essential values are fine 
# They do their job alright.

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///paper-guides.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

createDatabase()

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
    print(level)
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

    # print(question)
    return render_template('qp.html', question = question )


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

        print(f"Received paper submission: {paper_type}, {subject}, {year}")  # Debug print

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

    # Handle login form submission
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if user and user.password == password:
            login_user(user)
            logger.info(f'User {username} logged in', extra={'http_request': True})
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            logger.warning(f'Failed login attempt for user {username}', extra={'http_request': True})
            flash('Login unsuccessful. Please check username and password.', 'danger')

    return render_template('login.html')

# @app.route('/logout')
# @login_required
# def logout():
#     logout_user()
#     return redirect(url_for('index'))

# @app.route('/signup', methods=['GET', 'POST'])
# def signup():
#     if current_user.is_authenticated:
#         return redirect(url_for('index'))

#     # Handle signup form submission
#     if request.method == 'POST':
#         username = request.form.get('username')
#         password = request.form.get('password')
#         email = request.form.get('email')

#         # Check if username or email already exists
#         existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
#         if existing_user:
#             flash('Username or email already exists. Please choose another.', 'danger')
#         else:
#             # Create new user with default role 'user'
#             new_user = User(username=username, password=password, email=email)
#             db.session.add(new_user)
#             db.session.commit()

#             flash('Account created successfully! You can now log in.', 'success')
#             return redirect(url_for('login'))

#     return render_template('signup.html')


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


# @app.route('/admin')
# @login_required
# def admin():
#     if current_user.role != 'admin':
#         flash('You do not have permission to access this page.', 'danger')
#         return redirect(url_for('index'))
    
#     # Logic for admin-only functionality
#     return render_template('admin.html')





@app.template_filter('b64encode')
def b64encode_filter(s):
    return base64.b64encode(s).decode('utf-8') if s else ''


if __name__ == '__main__':
    app.run(debug=True)
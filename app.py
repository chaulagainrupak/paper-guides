import os
from types import resolve_bases
from dotenv import load_dotenv

from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, send_from_directory, Response, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from datetime import datetime, timedelta

import base64
import subprocess
import random
import time
import re


# We are importing all the required functions from the following files inorder to make a huge app file?

# Not the best way to put everything in one single file but, whaterver
from paperGuidesDB import *
from config import *
from logHandler import getCustomLogger

# Load environment variables from .env file

load_dotenv('.env')

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["https://paperguides.org"])

# Replace hardcoded values with environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', default=False)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

TURNSTILE_SECRET_KEY = os.getenv('TURNSTILE_SECRET_KEY')

db.init_app(app)

# Initialize custom logger
logger = getCustomLogger(__name__)

# path for the config
configPath = './configs/config.json'
config = loadConfig(configPath)


# Initialize Flask-Login
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)


migrate = Migrate(app, db)

createDatabase()
# Create the database
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    logger.info(f'Home page accessed IP: {getClientIp()}')
    return render_template('index.html')


"""
These routes handle the question papers list and link all the questions in a neat way

allows papole that run wget / curl to spider the site easily and get the data

Maybe in the future there will be a API endpoint to get the data or maybe even database dump torrent?

This part may not require rewrites


YK I realised that i can just do route(<mode>/) but I am in a bit of a *issue* here do I want to? 

we can reduce a shit ton of lines but for the time frame I have untill 2025 (today is dec 08 24) so i just want to get topicals up and running 
forgive me for this shit code.
"""

@app.route('/levels')
def getLevels():
    logger.info(f'Levels page accessed IP: {getClientIp()}')
    config = loadConfig(configPath)
    return render_template('levels.html',config=config, mode = "papers" )

@app.route('/subjects/<level>')
def getLevelSubjects(level):
    try:
        logger.info(f'Subjects page accessed for level {level} IP: {getClientIp()}')
        config = loadConfig(configPath)

        if level.lower() in ["a levels", "a level"]:
            level = "A Levels"
        
        levels = [level for level in config]
        
        if level in levels:
            return render_template('subject.html', config = config, level = level, mode = "papers")
        else:
            return render_template('404.html'), 404
    except Exception as e:
        logger.warn(f'{e}')

@app.route('/subjects/<level>/<subject_name>')
def getSubjectYears(level, subject_name):
    logger.info(f'Years page accessed for level {level}, subject {subject_name} IP: {getClientIp()}')
    years = getYears(level,subject_name)
    return render_template('years.html', subject_name = subject_name, level = level, years = years)


@app.route('/subjects/<level>/<subject_name>/<year>')
def getSubjectQuestions(level ,subject_name, year):
    logger.info(f'Questions page accessed for level {level}, subject {subject_name}, year {year} IP: {getClientIp()}')
    question_name = getQuestions(level, subject_name, year)
    return render_template('questions.html', questions_name = question_name, subject_name = subject_name ,year = year, config = config, level = level )


@app.route('/subjects/<level>/<subject_name>/<year>/<path:file_data>')
def renderSubjectQuestion(level, subject_name, year, file_data):
    # Log the request
    logger.info(f'Question rendered for level {level}, subject {subject_name}, year {year}, file {file_data} IP: {getClientIp()}')

    try:
        # Extract component number
        component = file_data.split(', ')[1]

        # Extract subject code (e.g., "9618" from "Computer Science (9618)")
        subject_code = file_data.split('(')[1].split(')')[0]

        # Extract session (e.g., "May / June" from "Year: 2023 (May / June)")
        session = file_data.split('(')[2].split(')')[0].strip()

        # Extract and validate full year
        if "question" in file_data:
            full_year = file_data.split('Year: ')[1].split(' question')[0]
        elif "mark" in file_data:
            full_year = file_data.split('Year: ')[1].split(' mark')[0]
        else:
            return render_template('404.html'), 404

        # Generate SEO keywords
        session_clean = session.lower().replace(' / ', '/')
        session_short = session_clean.replace('may/june', 'm/j').replace('october/november', 'o/n')
        
        keywords = [
            # Original format
            f"{file_data}",
            f"{subject_name} {full_year}",
            f"{level} {subject_name}",
            
            # Code-based formats
            f"{subject_code} past papers",
            f"{subject_code} {full_year}",
            f"{subject_code} {session_clean} {full_year}",
            f"{subject_code} {session_short} {full_year}",
            
            # Component variations
            f"{subject_code} {component}",
            f"{subject_code} {component} {session_clean} {full_year}",
            f"{subject_code} {component} {session_short} {full_year}",
            
            # Short formats (matching real search patterns)
            f"{subject_code} {component} mj {full_year[-2:]}",
            f"{subject_code} {component} on {full_year[-2:]}",
            f"{subject_code}{component}mj{full_year[-2:]}",
            f"{subject_code}{component}on{full_year[-2:]}",
            
            # Board variations
            f"cambridge {subject_name} {full_year}",
            f"caie {subject_code}",
            f"cie {subject_code}",
            
            # Resource types
            f"{subject_code} past papers {full_year}",
            f"{subject_code} question paper {full_year}",
            f"{subject_code} mark scheme {full_year}",
            
            # Component specific
            f"paper {component} {full_year}",
            f"{subject_name} paper {component}",
            
            # Study materials
            f"{subject_code} revision materials",
            f"{subject_code} study guide",
            f"{level} {subject_name} resources"
        ]
        
        # Remove duplicates while preserving order
        unique_keywords = []
        seen = set()
        for k in keywords:
            if k not in seen and k.strip():
                seen.add(k)
                unique_keywords.append(k)
        
        # Generate meta description
        meta_description = (
            f"Access {level} {subject_name} ({subject_code}) {component} {session} {full_year} "
            f"past papers, mark schemes, and study resources. Free download available for "
            f"{subject_name} Paper {component} {full_year}."
        )

        # Render question
        question = renderQuestion(level, subject_name, full_year, component)
        
        # Return template with all necessary data
        return render_template(
            'qp.html',
            question=question[0],
            solution=question[1],
            file_data=file_data,
            id=question[2],
            config=config,
            keywords=", ".join(unique_keywords),
            meta_description=meta_description,
            subject_code=subject_code,
            session=session,
            component=component
        )

    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        return render_template('404.html'), 404


@app.route('/topicals')
def modelQuestions():
    logger.info(f'Topicals page accessed IP: {getClientIp()}')
    config = loadConfig(configPath)
    return render_template('levels.html',config=config, mode = "topicals" )

@app.route('/topicals/<level>')
def getLevelSubjectsForTopicals(level):
    logger.info(f'Subjects page accessed for level {level} IP: {getClientIp()}')
    config = loadConfig(configPath)
    return render_template('subject.html', config = config, level = level, mode = "topicals")

@app.route('/topicals/<level>/<subject_name>')
def getTopicals(level, subject_name):
    logger.info(f'Topicals page accessed for level {level}, subject {subject_name} IP: {getClientIp()}')
    files = getTopicalFiles(level,subject_name)
    config = loadConfig(configPath)

    if level in ["A level", "AS level"]:
        level = "A Levels"
    else:
        level = "NEB"

    subjects = config[level]["subjects"]

    for subject in subjects:
        if subject["name"] == subject_name:
            topics = subject["topics"]
            break

    return render_template('topicals.html', subject_name = subject_name, level = level, topics = topics, files = files)

@app.route('/topicals/<level>/<subject_name>/<uuid>')
def renderTopical(level ,subject_name, uuid):
    logger.info(f'Topical  page accessed for subject {subject_name}, uuid {uuid} IP: {getClientIp()}')

    question = renderTopcial(uuid)
    return render_template('qp.html', question=question[0], solution= question[1], file_data = f"Topical question paper for {subject_name} and topic: {question[3]}",  id=question[2], config=config)


@app.route('/view-pdf/<type>/<uuid>')
def viewPdf(type, uuid):
    logger.info(f'{type}: {uuid} rendered in full screen. IP: {getClientIp()}')

    paper = get_paper(uuid)

    if paper == None:
        paper = get_topical(uuid)

        if type == "solution":
            title = f'{paper["subject"]} MS'
        elif type == "question":
            title = f'{paper["subject"]} QP'
    else:
        if paper["board"].lower() in ["a level", "as level", "a levels"]:

            # Extract the number inside parentheses using regex
            subjectCodeMatch = re.search(r"\d+", paper["subject"])
            subjectCode = subjectCodeMatch.group(0) if subjectCodeMatch else paper["subject"]

            yearStr = str(paper["year"])
            session = "MJ" if "May / June" in yearStr else "ON" if "Oct / Nov" in yearStr else "FM"


            if type == "solution":
                title = f'{subjectCode},{paper["component"]},{yearStr[2:4]},{session} MS'
            elif type == "question":
                title = f'{subjectCode},{paper["component"]},{yearStr[2:4]},{session} QP'
        else:
            if type == "solution":
                title = f'{paper["subject"]} MS'
            elif type == "question":
                title = f'{paper["subject"]} QP'

    if paper == None:
        return render_template('404.html'), 404

    if type == "question":
        return render_template('qp-full.html', question=paper["questionFile"], title=title), 200
    elif type == "solution":
        return render_template('qp-full.html', question=paper["solutionFile"], title=title), 200
    else:
        return redirect(url_for('index')), 304


# Reders the about page. Duh

@app.route('/about')
def about():
    logger.info(f'About page accessed IP: {getClientIp()}')
    return render_template('about.html')



# This is the route to the question genreation page where the user selects their desired questions

@app.route('/question-generator')
def questionGenerator():
    allowedSubjects = ["Mathematics (9709)", "Physics (9702)", "Chemistry (9701)", "Biology (9700)"]
    logger.info(f'Question generator page accessed IP: {getClientIp()}')

    config = loadConfig(configPath)

    # Filter subjects for A Levels
    config["A Levels"]["subjects"] = [
        subject for subject in config["A Levels"]["subjects"] if subject["name"] in allowedSubjects
    ]

    return render_template('question-generator.html', config=config)


# This route displays the questions the uppper route genetated a diffrent page and route
@app.route('/question-gen', methods=['POST', 'GET'])
def questionGen():
    logger.info(f'Question generation initiated IP: {getClientIp()}')
    if request.method == 'POST':
        try:
            # Extract form data
            board = request.form.get('board')
            subject = request.form.get('subject')
            level = request.form.get('level')
            topics = request.form.getlist('topic')
            difficulties = request.form.getlist('difficulty')
            components = request.form.getlist('component')

            # Handle ALL selections
            if 'ALL' in topics:
                topics = 'ALL'
            else:
                topics = [topic for topic in topics]

            if 'ALL' in difficulties:
                difficulties = 'ALL'
            else:
                difficulties = [difficulty for difficulty in difficulties]

            if 'ALL' in components:
                components = 'ALL'
            else:
                components = [component for component in components]

            # Get questions
            rows = getQuestionsForGen(board, subject, level, topics, components, difficulties)

            count = countQuestions(subject, level)
            return render_template('qpgen.html', rows=rows, count = count)
        except Exception as e:
            logger.error(f'Error in question generation: {str(e)} IP: {getClientIp()}')
            return redirect(url_for('questionGenerator'))
    else:
        return redirect(url_for('questionGenerator'))


@app.route('/submit')
def submit():
    logger.info(f'Submit page accessed IP: {getClientIp()}')
    config = loadConfig(configPath)
    return render_template('submit.html', config = config, year = int(datetime.now().year))

@app.route('/submitQuestion', methods=['POST'])
@login_required
def submitQuestion():

    # Get the Turnstile token from the form submission
    turnstileToken = request.form.get("cf-turnstile-response")
    if not turnstileToken:
        logger.warning(f'Turnstile token missing IP: {getClientIp()}')
        return render_template('error.html', error_title = "Did you forget the captcha!?", error_message = "Please try again by completing the captcha."), 400

    # Verify the token with enhanced verification
    verificationResult = verifyTurnstile(turnstileToken)

    # Check verification success
    if not verificationResult.get("success"):
        logger.warning(
            f'Failed Turnstile verification. '
            f'Errors: {verificationResult.get("error-codes", [])} '
            f'Attempts: {verificationResult.get("attempts", 1)}' +
            ' IP: ' + str(getClientIp())
        )
        return render_template('error.html', error_title = "Failed to verify captcha.", error_message = f"Please try again. {verificationResult.get('message', 'Unknown error')}"), 403


    logger.info(f'Question submission initiated IP: {getClientIp()}')
    board = request.form.get('board')
    subject = request.form.get('subject')
    topic = request.form.get('topic')
    difficulty = request.form.get('difficulty')
    level = request.form.get('level')
    component = request.form.get('component')
    questionFile = request.files['questionFile'].read()
    solutionFile = request.files['solutionFile'].read()


    if insertQuestion(board, subject, topic, difficulty, level, component, questionFile, solutionFile, current_user.username, getClientIp()):
        logger.info(f'Question submitted successfully IP: {getClientIp()}')
        return redirect(url_for('index'))
    else:
        logger.error(f'Error occurred while submitting question IP: {getClientIp()}')
        return "Error occurred while submitting question", 500

@app.route('/submitPaper', methods=['POST'])
@login_required
def submitPaper():

    isHeadless = request.headers.get('headless')

    if not isHeadless:
        # Get the Turnstile token from the form submission
        turnstileToken = request.form.get("cf-turnstile-response")
        if not turnstileToken:
            logger.warning(f'Turnstile token missing IP: {getClientIp()}')
            return render_template('error.html', error_title = "Did you forget the captcha!?", error_message = "Please try again by completing the captcha."), 400

        # Verify the token with enhanced verification
        verificationResult = verifyTurnstile(turnstileToken)

        # Check verification success
        if not verificationResult.get("success"):
            logger.warning(
                f'Failed Turnstile verification. '
                f'Errors: {verificationResult.get("error-codes", [])} '
                f'Attempts: {verificationResult.get("attempts", 1)}' +
                ' IP: ' + str(getClientIp())
            )
            return render_template('error.html', error_title = "Failed to verify captcha.", error_message = f"Please try again. {verificationResult.get('message', 'Unknown error')}"), 403


    logger.info(f'Paper submission initiated IP: {getClientIp()}')
    try:
        board = request.form.get('board')
        subject = request.form.get('subject')
        year = request.form.get('year')
        session = request.form.get('session')
        level = request.form.get('level')
        component = request.form.get('component')
        questionFile = request.files['questionFile'].read()
        solutionFile = request.files['solutionFile'].read()
        paper_type = request.form.get('paper_type')
        topic = request.form.get('topic')


        # Format year with session for A Levels
        if board == "A Levels" and session:
            # Convert session values to display format
            session_display = {
                "specimen": "Specimen",
                "feb-mar": "Feb / Mar",
                "may-june": "May / June",
                "oct-nov": "Oct / Nov"
            }
            formatted_year = f"{year} ({session_display.get(session, session)})"
        else:
            formatted_year = year

        if paper_type == 'yearly':
            if not year:
                raise ValueError("Year is required for yearly papers")
            result , uuid= insertPaper(board, subject, formatted_year, level, component, questionFile, solutionFile, current_user.username, getClientIp())
        elif paper_type == 'topical':
            result, uuidStr = insertTopical(board, subject, topic, questionFile, solutionFile, current_user.username, getClientIp())
        else:
            raise ValueError(f"Invalid paper type: {paper_type}")

        if result:
            logger.info(f'Paper submitted successfully, Type: {paper_type} IP: {getClientIp()}')

        if result and paper_type == 'yearly':
            logger.info(f'Paper submitted successfully IP: {getClientIp()}')
            if current_user.role == 'admin':
                if approvePaper(uuid)[1] == 400:
                    return redirect(f'admin/paper/{uuid}')
            return redirect(url_for('submit'))

    except Exception as e:
        logger.error(f'Error in paper submission: {str(e)} IP: {getClientIp()}')
        return f"Error occurred while submitting paper: {str(e)}", 500

    finally:
        if result:
            return redirect(url_for('submit'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':

        isHeadless = request.headers.get('headless')

        if not isHeadless:
            # Get the Turnstile token from the form submission
            turnstileToken = request.form.get("cf-turnstile-response")
            if not turnstileToken:
                logger.warning(f'Turnstile token missing IP: {getClientIp()}')
                return render_template('error.html', error_title = "Did you forget the captcha!?", error_message = "Please try again by completing the captcha."), 400

            # Verify the token with enhanced verification
            verificationResult = verifyTurnstile(turnstileToken)

            # Check verification success
            if not verificationResult.get("success"):
                logger.warning(
                    f'Failed Turnstile verification. '
                    f'Errors: {verificationResult.get("error-codes", [])} '
                    f'Attempts: {verificationResult.get("attempts", 1)}' +
                    ' IP: ' + str(getClientIp())
                )
                return render_template('error.html', error_title = "Failed to verify captcha.", error_message = f"Please try again. {verificationResult.get('message', 'Unknown error')}"), 403

        username_or_email = request.form.get('username')
        password = request.form.get('password')

        # Check if input is an email
        if '@' in username_or_email:
            user = User.query.filter_by(email=username_or_email).first()
        else:
            user = User.query.filter_by(username=username_or_email).first()

        # Check if user exists and the password matches
        if user and check_password_hash(user.password, password):

            session.permanent = True

            login_user(user)
            logger.info(f'User {user.username} logged in IP: {getClientIp()}')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            logger.warning(f'Failed login attempt for {username_or_email} IP: {getClientIp()}')
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
        # Get the Turnstile token from the form submission
        turnstileToken = request.form.get("cf-turnstile-response")
        if not turnstileToken:
            logger.warning(f'Turnstile token missing IP: {getClientIp()}')
            return render_template('error.html', error_title = "Did you forget the captcha!?", error_message = "Please try again by completing the captcha."), 400

        # Verify the token with enhanced verification
        verificationResult = verifyTurnstile(turnstileToken)

        # Check verification success
        if not verificationResult.get("success"):
            logger.warning(
                f'Failed Turnstile verification. '
                f'Errors: {verificationResult.get("error-codes", [])} '
                f'Attempts: {verificationResult.get("attempts", 1)}' +
                ' IP: ' + str(getClientIp())
            )
            return render_template('error.html', error_title = "Failed to verify captcha.", error_message = f"Please try again. {verificationResult.get('message', 'Unknown error')}"), 403

        username = request.form.get('new-username')
        password = request.form.get('new-password')
        email = request.form.get('new-email')

        # Check if username or email already exists
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Username or email already exists. Please choose another.', 'danger')
        elif len(username) < 3 or len(username) > 30:
            flash('Username is not long enough or really short. Please choose another.', 'danger')
        else:
            # Hash the password before storing it
            hashed_password = generate_password_hash(password)

            # Create new user with hashed password
            new_user = User(username=username, password=hashed_password, email=email)
            db.session.add(new_user)
            db.session.commit()

            flash('Account created successfully! You can now log in.', 'success')
            return redirect(url_for('login'))

    return render_template('login.html')


# Will profiles even be a thing ? Public IDK but chaning the email password will be implemented

@app.route('/profile')
@login_required
def profile():

    try:
        user = current_user
        logger.info(f'User {user.username} accessed profile IP: {getClientIp()}')
    except Exception as e:
        logger.error(f'Error in profile: {str(e)} IP: {getClientIp()}')
    return render_template('profile.html')

@app.route('/change-password', methods=['POST'])
def changePassword():
    try:
        previous_password = request.form.get('current-password')
        new_password = request.form.get('new-password')

        if check_password_hash(current_user.password, previous_password):
            # Hash the password before storing it
            hashed_password = generate_password_hash(new_password)

            # Update the user's password
            current_user.password = hashed_password
            db.session.commit()

            logger.info(f'User {current_user.username} changed password IP: {getClientIp()}')

            return redirect(url_for('logout'))
        else:
            logger.warning(f'Failed to change password for user {current_user.username} IP: {getClientIp()}')
            flash('Current password is incorrect.', 'error')

        return redirect(url_for('profile'))

    except Exception as e:
        logger.error(f'Error in changing password: {str(e)} IP: {getClientIp()}')
        flash('An error occurred while changing password.', 'error')
        return redirect(url_for('profile'))


# @app.route('/rate/<question_UUID>/<int:rating>', methods = ['POST'])
# @login_required
# def rate(question_UUID, rating):
#     try:
#         user = current_user.id
#         if giveRating(user, question_UUID, rating):
#             logger.info(f'User {user} rated question {question_UUID} with {rating} IP: {getClientIp()}')
#             return True
#         else:
#             logger.warning(f'Failed to rate question {question_UUID} IP: {getClientIp()}')
#             return False
#     except Exception as e:
#         logger.error(f'Error in rating: {str(e)} IP: {getClientIp()}')
#         return False



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
        topicals = get_unapproved_topicals()

        data = {
            "questions": [],
            "papers": [],
            "topicals": []
        }

        for question in questions:
            data["questions"].append({
                "uuid": question["uuid"],
            })

        for paper in papers:
            data["papers"].append({
                "uuid": paper["uuid"],
            })

        for topical in topicals:
            data["topicals"].append({
                "id": topical["uuid"],
        })

        logger.info('Data sent to the admin page successfully')
        return render_template('admin.html', data=data)

    except Exception as e:
        logger.error(f'Error retrieving unapproved questions or papers: {e}')
        return render_template('admin.html', data={"error": "An error occurred while retrieving data."})

@app.route('/admin/question/<uuid>', methods=['GET'])
@login_required
def adminShowQuestion(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Unauthorized access attempt by user: {current_user.username} from IP: ', getClientIp())
        return redirect(url_for('index'))

    try:
        logger.info(f'Question page addessed for paper {uuid} By: {current_user.username} with role: {current_user.role} IP: ' + str(getClientIp()))
        return render_template('admin-question.html', question=get_question(uuid))
    except Exception as e:
        logger.warning("Error retrieving question: " + str(e))

@app.route('/admin/paper/<uuid>', methods=['GET'])
@login_required
def adminShowPaper(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Unauthorized access attempt by user: {current_user.username} from IP: ', getClientIp())
        return redirect(url_for('index'))
    try:
        logger.info(f'Paper page addessed for paper {uuid} By: {current_user.username} with role: {current_user.role} IP: ' + str(getClientIp()))
        return render_template('admin-paper.html', paper=get_paper(uuid))
    except Exception as e:
        logger.warning("Error retrieving paper: " + str(e))

@app.route('/admin/topical/<uuid>', methods=['GET'])
@login_required
def adminShowTopical(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Unauthorized access attempt by user: {current_user.username} from IP: ', getClientIp())
        return redirect(url_for('index'))
    try:
        logger.info(f'Topical page addessed for paper {uuid} By: {current_user.username} with role: {current_user.role} IP: ' + str(getClientIp()))
        return render_template('admin-topical.html', topical=get_topical(uuid))
    except Exception as e:
        logger.warning("Error retrieving paper: " + str(e))


@app.route('/admin/update_rating/<uuid>', methods=['POST'])
@login_required
def updateRatingAdmin(uuid):
    rating = request.form.get('rating')

    if not rating or not rating.isdigit() or int(rating) not in range(1, 6):
        logger.error(f"Invalid rating received: {rating}")
        return redirect(url_for('index'))

    if current_user.role != 'admin':
        logger.warning(f"Unauthorized access attempt by user: {current_user.username} from IP: {getClientIp()}")
        return redirect(url_for('index'))

    if upadte_rating(uuid, int(rating)):
        logger.info(f"Question {uuid} rating updated to {rating}")
        return redirect(url_for('admin_dashboard'))
    else:
        logger.error(f"Failed to update question {uuid} rating to {rating}")
        return redirect(url_for('index'))

@app.route('/getNewData', methods=["POST"])
@login_required
def getNewData():
    if current_user.role != 'admin':
        logger.warning(f'Admin page / endpoint is trying to be accessed by a non-admin IP: {getClientIp()}')
        logger.warning(f'Unauthorized access attempt by user: {current_user.username}')
        return redirect(url_for('index'))

    try:
            questions = get_unapproved_questions()
            papers = get_unapproved_papers()
            topicals = get_unapproved_topicals()

            data = {
                "questions": [],
                "papers": [],
                "topicals": []
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
                    "submittedBy": question["submittedBy"],
                    "submittedOn": question["submitDate"]
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
                    "submittedBy": paper["submittedBy"],
                    "submittedOn": paper["submitDate"]
                })

            for topical in topicals:
                data["topicals"].append({
                    "id": topical["id"],
                    "uuid": topical["uuid"],
                    "subject": topical["subject"],
                    "submittedBy": topical["submittedBy"],
                    "submittedOn": topical["submitDate"]
                })

            return jsonify(data)
    except Exception as e:
        logger.error(f'Error processing getNewData: {e}')
        return jsonify({"error": "An error occurred while processing the request."}),

@app.route('/approve_question/<uuid>' , methods=["POST"])
@login_required
def approve(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Admin page / endpoint is trying to be accessed by a non-admin IP: {getClientIp()}')
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    if approve_question(current_user.username, uuid):
        return jsonify({"message": "Your request was processed successfully"})
    else:
        return jsonify({"error": "Your request was not processed successfully"})

@app.route('/approve_paper/<uuid>', methods=["GET", "POST"])
@login_required
def approvePaper(uuid):
    if current_user.role != 'admin':
        logger.warning(
            f"Admin page / endpoint is trying to be accessed by a non-admin user. IP: {getClientIp()}"
        )
        return redirect(url_for('index'))

    if approve_paper(current_user.username, uuid):
        logger.info(f"Paper {uuid} was approved by {current_user.username}")
        # Returning plain text for success with a 200 status
        return f"Paper {uuid} was approved by {current_user.username}", 200
    else:
        logger.error(f"Paper {uuid} was unable to be approved by {current_user.username}")
        return f"Paper {uuid} was unable to be approved", 400

@app.route('/approve_topical/<uuid>', methods=["GET", "POST"])
@login_required
def approveTopical(uuid):
    if current_user.role != 'admin':
        logger.warning(
            f"Admin page / endpoint is trying to be accessed by a non-admin user. IP: {getClientIp()}"
        )
        return redirect(url_for('index'))

    if approve_topical(current_user.username, uuid):
        logger.info(f"Topcial {uuid} was approved by {current_user.username}")
        # Returning plain text for success with a 200 status
        return f"Topcial {uuid} was approved by {current_user.username}", 200
    else:
        logger.error(f"Topcial {uuid} was unable to be approved by {current_user.username}")
        return f"Topcial {uuid} was unable to be approved", 400


@app.route('/delete_question/<uuid>', methods=["POST"])
@login_required
def deleteQuestion(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Admin page / endpoint is trying to be accessed by a non-admin IP: {getClientIp()}')
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    logger.info(f"Deletion process started for question with UUID: {uuid}")
    if delete_question(uuid):
        logger.info(f"Question successfully delete with UUID: {uuid}")    
        return jsonify({"success": "Your request was processed successfully"}), 200
    else:
        logger.info(f"Question deletion failed with UUID: {uuid}")    
        return jsonify({"error": "Your request was not processed successfully"}), 304


@app.route('/delete_paper/<uuid>', methods=["POST"])
@login_required
def deletePaper(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Admin page / endpoint is trying to be accessed by a non-admin IP: {getClientIp()}')
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    logger.info(f"Deletion process started for paper with UUID: {uuid}")
    if delete_paper(uuid):
        logger.info(f"Paper successfully delete with UUID: {uuid}")    
        return jsonify({"success": "Your request was processed successfully"}), 200
    else:
        logger.info(f"Paper deletion failed with UUID: {uuid}")    
        return jsonify({"error": "Your request was not processed successfully"}), 304

@app.route('/delete_topical/<uuid>', methods=["POST"])
@login_required
def deleteTopical(uuid):
    if current_user.role != 'admin':
        logger.warning(f'Admin page / endpoint is trying to be accessed by a non-admin IP: {getClientIp()}')
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    logger.info(f"Deletion process started for topical with UUID: {uuid}")
    if delete_topical(uuid):
        logger.info(f"Topical successfully delete with UUID: {uuid}")    
        return jsonify({"success": "Your request was processed successfully"}), 200
    else:
        logger.info(f"Topical deletion failed with UUID: {uuid}")    
        return jsonify({"error": "Your request was not processed successfully"}), 304

# Temporary solution man
# A route to give admin access to user accounts
@app.route('/admin/give_admin/<username>', methods=['POST'])
@login_required
def give_admin(username):
    if current_user.role != 'admin':
        logger.warning(f'Admin page / endpoint is trying to be accessed by a non-admin IP: {getClientIp()}')
        flash('Access denied. Administrator privileges required.', 'error')
        return redirect(url_for('index'))

    try:
        user = User.query.filter_by(username=username).first()
        if not user:
            logger.warning('User not found: ' + username)
            return jsonify({"error": "User not found"}), 404
        if user.role == 'admin':
            logger.info('User already has admin privileges: ' + username)
            return jsonify({"error": "User already has admin privileges"}), 400

        user.role = 'admin'
        db.session.commit()
        logger.info('Admin privileges given to user: ' + username)
        return jsonify({"message": "Admin privileges given successfully"}), 200
    except Exception as e:
        logger.error(f'Error giving admin privileges: {e}')
        return False


@app.template_filter('b64encode')
def b64encode_filter(s):
    return base64.b64encode(s).decode('utf-8') if s else ''

@app.route('/robots.txt')
def robotsTxt():
    logger.info(f'robots.txt accessed from IP: {getClientIp()}')
    return send_from_directory(app.static_folder, 'robots.txt')

@app.route('/stats')
def stats():
    statsData = getStat(config)
    logger.info(f'Stats page accessed IP: {getClientIp()}')
    return render_template('stats-page.html', statsData=statsData)




# SPECIALS 



@app.route('/sitemap.xml')
def sitemap():
    logger.info(f'Sitemap accessed IP: {getClientIp()}')
    return send_from_directory(os.path.expanduser('~/paper-guides/static'), 'sitemap.xml', mimetype='application/xml'), 200

@app.route('/ads.txt')
def adsTxt():
    logger.info(f'ads.txt accessed IP: {getClientIp()}')
    return send_from_directory(os.path.expanduser('~/paper-guides/static'), 'ads.txt', mimetype='text/plain'), 200

@app.errorhandler(404)
def page_not_found(e):

    if ".php" in request.url.lower():
        logger.warning(f"Stupid wordpress scanner. Eat dirt | URL: {request.url} | IP: {getClientIp()}")
        return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ") 
        
    logger.warning(f"404 Not Found | URL: {request.url} | IP: {getClientIp()}")
    return render_template('404.html'), 404

# Define a reusable function to get the client's IP address
def getClientIp():
    # Try to get the IP from the 'X-Forwarded-For' header (Cloudflare/proxy header)
    return request.headers.get('X-Forwarded-For', request.remote_addr)


def verifyTurnstile(token, max_retries=3):
    """
    Verify Cloudflare Turnstile CAPTCHA token with robust retry mechanism.

    Args:
        token (str): The Turnstile response token
        max_retries (int): Maximum number of retry attempts

    Returns:
        dict: Verification result with 'success' and detailed error information
    """
    # Initial validation of token
    if not token or not isinstance(token, str) or len(token) > 1000:
        logger.warning('Invalid Turnstile token')
        return {
            "success": False,
            "error-codes": ["invalid-input-token"],
            "message": "Invalid or too long token"
        }

    # Payload for verification
    payload = {
        "secret": TURNSTILE_SECRET_KEY,
        "response": token
    }

    # Retry loop with exponential backoff
    for attempt in range(max_retries):
        try:
            # Calculate exponential backoff with jitter
            if attempt > 0:
                # Exponential backoff with jitter to prevent thundering herd problem
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                time.sleep(wait_time)

            # Make request with timeout
            response = requests.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data=payload,
                timeout=5  # 5-second timeout
            )
            # Raise an exception for bad HTTP responses
            response.raise_for_status()

            # Parse response
            result = response.json()

            # Successful verification
            return {
                "success": result.get("success", False),
                "error-codes": result.get("error-codes", []),
                "message": "Verification complete",
                "attempts": attempt + 1
            }

        except requests.exceptions.Timeout:
            logger.warning(f"Turnstile verification timed out. Attempt {attempt + 1}/{max_retries}")
            # Continue to next retry
            continue

        except requests.exceptions.ConnectionError:
            logger.warning(f"Network connection error. Attempt {attempt + 1}/{max_retries}")
            # Continue to next retry
            continue

        except requests.exceptions.RequestException as e:
            logger.error(f"Network error in Turnstile verification: {e}")
            # For some errors, we might want to exit early
            if attempt == max_retries - 1:
                return {
                    "success": False,
                    "error-codes": ["network-error"],
                    "message": f"Network error after {max_retries} attempts: {str(e)}",
                    "attempts": max_retries
                }
            continue

        except ValueError:  # JSON parsing error
            logger.error(f"Failed to parse Turnstile response. Attempt {attempt + 1}/{max_retries}")
            # Continue to next retry
            continue

    # If all retries fail
    logger.error("All Turnstile verification attempts failed")
    return {
        "success": False,
        "error-codes": ["verification-failed"],
        "message": f"Failed to verify token after {max_retries} attempts",
        "attempts": max_retries
    }

if __name__ == '__main__':
    app.run(debug=True)



# app.py

from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from models import db, User
from datetime import datetime
import base64


from paperGuidesDB import *
from config import *


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///paper-guides.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

createDatabase()

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
    return render_template('index.html')

@app.route('/level')
def getLevels():
    config = loadConfig(configPath)
    return render_template('levels.html',config=config )

@app.route('/subjects/<int:level>')
def getLevelSubjects(level):
    print(level)
    config = loadConfig(configPath)
    return render_template('subject.html', config = config, level = level)


@app.route('/subjects/<int:level>/<subject_name>')
def getSubjectYears(level, subject_name):

    years = getYears(level,subject_name)
    return render_template('years.html', subject_name = subject_name, level = level, years = years)


@app.route('/subjects/<int:level>/<subject_name>/<int:year>')
def getSubjectQuestions(level ,subject_name, year):

    question_name , questions = getQuestions(level, subject_name, year)
    return render_template('questions.html', questions_name = question_name)



@app.route('/submit')
def submit():

    config = loadConfig(configPath)

    return render_template('submit.html', config = config)


@app.route('/submitQuestion', methods=['POST'])
def submitQuestion():
    # Get form data
    board = request.form.get('board')
    subject = request.form.get('subject')
    topic = request.form.get('topic')
    difficulty = request.form.get('difficulty')
    level = request.form.get('level')
    component = request.form.get('component')
    questionFile = request.files['questionFile']
    solutionFile = request.files['solutionFile']

    # Call insertQuestion function
    if insertQuestion(board, subject, topic, difficulty, level, component, questionFile, solutionFile):
        return redirect(url_for('index'))  # Redirect to home or any other page on success
    else:
        return "Error occurred while submitting question", 500  # Return an error message on failure


"""
This functionality for the user login and authentication will be implemented later so this part of the code has been commented.

This allows for more functionalities for uploading user submitted data and allowing users to post ratings for the questions. 

"""


# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if current_user.is_authenticated:
#         return redirect(url_for('index'))

#     # Handle login form submission
#     if request.method == 'POST':
#         username = request.form.get('username')
#         password = request.form.get('password')
#         user = User.query.filter_by(username=username).first()

#         if user and user.password == password:
#             login_user(user)
#             next_page = request.args.get('next')
#             return redirect(next_page or url_for('index'))
#         else:
#             flash('Login unsuccessful. Please check username and password.', 'danger')

#     return render_template('login.html')

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

# @app.route('/profile')
# @login_required
# def profile():
#     return render_template('profile.html')

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

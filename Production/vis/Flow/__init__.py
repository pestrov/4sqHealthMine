from flask import Flask, redirect, request, Response
import logging
app = Flask(__name__)
app.config['DEBUG'] = True
logging.basicConfig(filename='error.log',level=logging.DEBUG)

@app.route("/")
def index():
    return redirect('/index.html')

@app.errorhandler(500)
def internal_error(exception):
    app.logger.exception(exception)

if __name__ == "__main__":
    app.run()

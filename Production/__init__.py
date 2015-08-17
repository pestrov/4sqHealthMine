from flask import Flask, redirect, request, Response, url_for
import os
import useful
from dataScripts import getTransitionDataDict
from werkzeug import secure_filename
import logging

UPLOAD_FOLDER = '/var/www/FlaskHello/FlaskHello/dataScripts/data/'
ALLOWED_EXTENSIONS = set(['tsv', 'csv'])

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

logging.basicConfig(filename='error.log',level=logging.DEBUG)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route("/upload", methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('upload'))
    return """
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    <p>%s</p>
    """ % "<br>".join(os.listdir(app.config['UPLOAD_FOLDER'],))

@app.route("/")
def hello():
    return redirect('/4sq/app/index.html')

@app.errorhandler(500)
def internal_error(exception):
    app.logger.exception(exception)

@app.route("/gettweets")
def gettweets():
    args = {}
    #print request.args
    if 'latest' in request.args:
        try:
            latest=int(request.args['latest'])
            args['latest'] = latest
        except:
            ret = 'parameter LATEST should be int type'
    if 'keyword' in request.args:
        try:
            args['substring'] = str(request.args['keyword'].encode('utf-8'))
            #ret = 'substring is %s length is %i type is %s' % (args['substring'],len(args['substring']),type(args['substring']))
        except:
            #print 'keyword is %s length is %i type is %s' % (request.args['keyword'],len(request.args['keyword']),type(request.args['keyword']))
            #print request.args['keyword'].encode('utf-8')
            ret = 'parameter KEYWORD should be string'
    if 'hours' in request.args:
        try:
            args['hours'] = int(request.args['hours'])
        except:
            ret = 'parameter HOURS should be int'
    if 'month' in request.args:
        try:
            args['month'] = int(request.args['month'])
        except:
            ret = 'parameter MONTH should be int'
    if args:
#         ret = ''
        ret = useful.getTweetsFromDB(**args)
    else: ret = 'no parameters given'

    resp = Response(response=ret,
                    status=200,
                    mimetype="application/json")
#    s = 'substring is %s length is %i type is %s' % (args['substring'],len(args['substring']),type(args['substring']))
    return resp

@app.route("/getTransitionData")
def getTransitionData():
    args = {}
    #print request.args
    if 'clusterId' in request.args:
        try:
            clusterId = int(request.args['clusterId'])
            args['clusterId'] = clusterId
        except:
            ret = 'parameter clusterId should be int type'
    if 'category' in request.args:
        try:
            args['category'] = str(request.args['category'].encode('utf-8'))
            #ret = 'substring is %s length is %i type is %s' % (args['substring'],len(args['substring']),type(args['substring']))
        except:
            #print 'keyword is %s length is %i type is %s' % (request.args['keyword'],len(request.args['keyword']),type(request.args['keyword']))
            #print request.args['keyword'].encode('utf-8')
            ret = 'parameter category should be string'
    if 'debug' in request.args:
        try:
            debug = int(request.args['debug'])
            args['debug'] = debug
        except:
            ret = 'parameter debug should be int type'
    if args:
        ret = getTransitionDataDict.getTransitionDataDict(**args)
    else:
        ret = 'no parameters given'

    resp = Response(response=ret,
                    status=200,
                    mimetype="application/json")
    return resp

if __name__ == "__main__":
    app.run()

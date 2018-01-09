#!/usr/bin/env python3

from flask import Flask, render_template, request, url_for, request, make_response, jsonify
import json, requests, datetime
import redis

app = Flask(__name__)
r = redis.StrictRedis(host='localhost', port=6379, db=0)

@app.route('/')
def index():
    ''' Home page of application '''
    return render_template("index.html")

@app.route('/foursquare/nearby')
def nearyby():
    '''Get nearby places using Foursquare API'''

    latlng = request.args.get('lat')+','+request.args.get('lng')
    foursquare = json.loads(open('config.json', 'r').read())['foursquare']

    # return response from cache, if exists
    cache = r.get(latlng)
    if cache is not None:
        return make_response(jsonify(json.loads(cache)), 200)

    params = {
        'll': latlng,
        'client_id': foursquare['client_id'],
        'client_secret': foursquare['client_secret'],
        'v': datetime.date.today().strftime('%Y%m%d')
    }

    response = requests.get('https://api.foursquare.com/v2/venues/explore', params=params)
    responseJSON = jsonify(response.json())

    # save response to cache for faster reponse
    r.set(latlng, json.dumps(response.json()))

    return make_response(responseJSON, 200)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

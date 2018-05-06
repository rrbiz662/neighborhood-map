#!usr/bin/env python2
import json
import requests
import os
from flask import Flask, request, make_response
from flask_cors import cross_origin
from urllib import quote


app = Flask(__name__)


# API constants.
API_KEY = "zboWotd5QomCFouN96e-YRf7deALxng825rC-GpXWbeoTGZmaOYtCy" \
            "l6U9eMOEJd09KNTzo6H12cbxoQb_jetLKrD_NHDf1fqVfYmAlEgv" \
            "G6TZdx2qvNPiVmLWvqWnYx"
API_HOST = "https://api.yelp.com"
SEARCH_PATH = "/v3/businesses/search"
SEARCH_LIMIT = 5
# About a 6 mile radius.
RADIUS = 10000


@app.route("/yelprequest/")
@cross_origin()
def yelp_request():
    """Forwards data request to Yelp and returns the data to the client."""
    params = {
        "term": "",
        "location": request.args.get("location").replace(" ", "+"),
        "limit": SEARCH_LIMIT,
        "radius": RADIUS
    }

    # Add required header to request.
    headers = {
        'Authorization': 'Bearer %s' % API_KEY,
    }

    url = '{0}{1}'.format(API_HOST, quote(SEARCH_PATH.encode('utf8')))
    # Send request to YELP.
    results = requests.request('GET', url, headers=headers, params=params)

    # Build response to return to the client.
    response = make_response(json.dumps(results.text), 200)
    response.headers["Content-Type"] = "application/json"

    return response


if __name__ == '__main__':
    # Running module as a program.
    app.secret_key = os.urandom(24)
    app.debug = True
    app.run(host="0.0.0.0", port=5000)

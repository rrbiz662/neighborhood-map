# neighborhood-map
This application is a `Mapping Application` that allows users to enter a location and returns businesses in the area. The application uses the `Google Maps API` for mapping functions and the `Yelp Fusion API` to retrieve the businesses. Additionally, the application uses `KnockoutJS` for data binding allowing for a more dynamic UI and `Bootstrap` for the styling.

 A python server is provided with the application to allow for `Cross-Origin Resource Sharing` (CORS). The server is built with `Flask` to allow app routing and `Flask-CORS` to enable CORS on the route. The server takes the request from the user and adds the additional header to allow for communication with the Yelp server. The server then returns the results to the front-end to build the `business models` and update the UI.

## Getting Started
These instructions will get you a copy of the project on your local machine for development and/or testing purposes.

### Prerequisites
To use the `VirtualBox` virtual machine (VM) the user will require [VirtualBox 5.1.34](https://www.virtualbox.org/wiki/Downloads)
or higher and [Vagrant 1.9.2](https://www.vagrantup.com/downloads.html) or higher .

To run the python script the user will require [Python 2.7.14](https://www.python.org/downloads/) or higher.

To view the webpage correctly an internet connection is required.

### Installing
To get a copy of the project to work on locally, the user can either `download the zip` or `clone the repository`.

## Run the Project
In order to run the project:
1) Open Terminal/Powershell.
2) Using the `cd` command, navigate to the directory where the project `Vagrantfile` is located.
3) Start the VM by using the command `vagrant up`.
4) Connect to the VM using the command `vagrant ssh`.
5) Navigate to the directory in the VM where the python script is located using the command `cd`.
6) Run the command `sudo pip install flask-cors` to install the `CORS` enabling module.
7) Run the python script using the command `python server.py`.
8) Open the `index.html` file in the preferred web browser.

## Built with
* `Python 2.7.14`
* `Flask 0.9`
* `Flask-CORS 3.0.4`
* `jQuery 3.3.1`
* `KnockoutJS 3.4.2`
* `Bootstrap 4.1.0`

## APIs used
* `Google Maps`
* `Google Geocoding`
* `Yelp Fusion`

## Authors
* Ricardo Rivera
# Neighborhood Map Overview
A single page application featuring a map of my neighborhood (Lagos, Nigeria).

# Integrated Third-Party APIs
- [FourSquare](foursquare.com/developers/apps)

# Installation
Outlined are the steps to take in order to run this application.
- Install Vagrant and VirtualBox
- Clone the [fullstack-nanodegree-vm](http://github.com/udacity/fullstack-nanodegree-vm)
- Copy/Move the application `neighborhood_map/` into `fullstack-nanodegree-vm/fullstack/vagrant`
- Launch the Vagrant VM (vagrant up)

# Running Server
SSH into the vagrant VM and move the project files into `neighborhood_map/` directory of vagrant (/vagrant/neighborhood_map)
Run `redis-server & python server.py` to start the server along with runing redis-server cache in the backgound
Access the application by visiting http://localhost:5000 locally on your browser.

#
# Using PyInvoke for build automation
#

from invoke import task, run

@task
def init(): pass
    # Use systemwide python2.7, easy because it knows where python-vtk is
    # sudo apt-get install python-vtk
    # pip install numpy
    # pip install mayavi
    # npm install

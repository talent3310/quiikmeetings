from fabric.api import *
from fabric.colors import green, yellow, red
from fabric.contrib.project import rsync_project
from fabric.contrib.console import confirm
from contextlib import contextmanager as _contextmanager
import time
import json


rsync_excludes = ("*.py", "*.pyc", "*.git", "*.sqlite", "node_modules")


def staging():
	env.settings = 'staging'
	env.user = 'anirudh'
	env.shell = "/bin/bash -l -i -c" 
	env.hosts = ['69.164.215.186']

def deploy():
	upload_app ()
	with cd ("/home/anirudh/meetint"):
		update_npm ()
		run_migrations ()
		restart_node ()
	print(green("##################################################################"))
	print(green("## Finished deploy without any known errors. Please still test. ##"))
	print(green("##################################################################"))

def upload_app ():
	rsync_project(
		remote_dir= "/home/anirudh/meetint",
		local_dir=".",
		exclude=rsync_excludes,
	)

def update_npm ():
	print ("Updating npm...");
	run ("npm install")

def run_migrations ():
	print ("Running migrations...");
	# No migrations for now. We will have to use mongoose later.
	# run ('sequelize db:migrate')

def restart_node ():
	print ("Restarting server...")
	run ("forever restartall")
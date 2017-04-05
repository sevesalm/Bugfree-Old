#!/bin/bash
mongoimport --db bugfree --collection projects --drop --jsonArray --file projects.json
mongoimport --db bugfree --collection users --drop --file users.json

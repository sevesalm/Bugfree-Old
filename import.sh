#!/bin/bash
mongoimport --db bugfree --collection projects --drop --jsonArray --file projects.json

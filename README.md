# Bugfree [![Travis](https://img.shields.io/travis/sevesalm/bugfree.svg)](https://travis-ci.org/sevesalm/Bugfree) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This is the repository for my personal website [Bugfree](http://www.bugfree.fi). It is running on Node.js/Express and uses Pug template language. It uses PostgreSQL as the database management system, [Ansible](https://www.ansible.com) for deployment and [Travis](https://travis-ci.org) for CI.

## Deployment

Deployment is done using [Ansible](https://www.ansible.com). Prerequisites:

- Ubuntu Server 16.10
- PostgreSQL 9.6 with database 'bugfree'
- ssh connection
- no ssh passphrase
- no sudo password

First create a configuration file `ansible/hosts.yaml` using `ansible/hosts-template.yaml` as a template. The actual deployment:

```shell
npm run deploy
```

## Roadmap

These are the features I'm planning to implement (in no order of importance):

- simple CMS for publishing articles or blog entries
- separate frontend
- implement frontend in [Elm](http://elm-lang.org)
- improved repository structure

## License

    Copyright (C) 2017 Severi Salminen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

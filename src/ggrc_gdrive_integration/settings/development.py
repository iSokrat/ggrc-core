# Copyright (C) 2017 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
import os

EXTENSIONS = ['ggrc_gdrive_integration']
exports = ["GAPI_KEY", "GAPI_CLIENT_ID", "GAPI_ADMIN_GROUP"]

GAPI_KEY = "AIzaSyA9Dn5WEtPZVKO1e2STmc96aNwfPmVu9qc"
GAPI_CLIENT_ID = "967058498045-dmis7v4bqgui29nrl7s7j8bu0dnvvt1k.apps.googleusercontent.com"
# Admin group gets writer access to all
GAPI_ADMIN_GROUP = os.environ.get('GGRC_GAPI_ADMIN_GROUP', "")
GAPI_CLIENT_SECRET = "Z7kDVv-TUDqmk38L84DlOAiJ"

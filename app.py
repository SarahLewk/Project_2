import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
#  Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql:///Data/Metadata.sql"
db = SQLAlchemy(app)
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root:SarahSQL@localhost:3306/project2KCC"
# db = SQLAlchemy(app)
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root:capital1@localhost:3306/project2KCC"
# db = SQLAlchemy(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)
# print(Base.classes.keys())

# Save references to each table
# metadata = Base.classes.apifields
# Samples = Base.classes.samples
metadata = Base.classes.metadata


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(metadata).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    return jsonify(list(df["ID"]))


@app.route("/metadata/<sample>")
def apifields(sample):
    """Return the MetaData for a given sample."""
    metadata
    sel = [
        metadata.ID,
        metadata.Count_of_Masked_Loan_Number,
        # metadata.Note_Sale_NPL,
        # metadata.Short_Payoff,
        # metadata.REO_Sale_DIL,
        # metadata.Foreclosure_Auction,
        # metadata.Full_Payoff,
        # metadata.Note_Sale_PL
    ]

    results = db.session.query(*sel).filter(metadata.ID == sample).all()

    # Create a dictionary entry for each row of metadata information
    apifields = {}
    for result in results:
        apifields["ID"] = result[0]
        apifields["Count_of_Masked_Loan_Number"] = result[1]
        # apifields["Note_Sale_NPL"] = result[2]
        # apifields["Short_Payoff"] = result[3]
        # apifields["REO_Sale_DIL"] = result[4]
        # apifields["Foreclosure_Auction"] = result[5]
        # apifields["Full_Payoff"] = result[6]
        # apifields["Note_Sale_PL"] = result[7]

    print(apifields)
    return jsonify(apifields)


#@app.route("/samples/<sample>")
#def samples(sample):
    #"""Return `otu_ids`, `otu_labels`,and `sample_values`."""
    #stmt = db.session.query(Samples).statement
    #df = pd.read_sql_query(stmt, db.session.bind)

    # Filter the data based on the sample number and
    # only keep rows with values above 1
    #sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]
    # Format the data to send as json
   # data = {
       # "otu_ids": sample_data.otu_id.values.tolist(),
      #  "sample_values": sample_data[sample].values.tolist(),
     #   "otu_labels": sample_data.otu_label.tolist(),
    #}
    #return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)

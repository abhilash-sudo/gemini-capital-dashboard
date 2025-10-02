from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.svm import SVR
from sklearn.model_selection import train_test_split

# Initialize the Flask app
app = Flask(__name__)
# Enable CORS (Cross-Origin Resource Sharing) to allow requests from your frontend
CORS(app) 

# --- Load and Train Your SVR Model ---
# This part is from your original Python script. In a real application, 
# you would save a trained model to a file and load it here to avoid retraining on every run.
dataset = pd.read_csv('data.csv')
X = dataset.iloc[:, :-1].values
Y = dataset.iloc[:, -1].values
x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size=0.20, random_state=0)

# Train the SVR model
model = SVR()
model.fit(x_train, y_train)

# --- API Endpoint for Prediction ---
@app.route('/predict', methods=['POST'])
def predict():
    # Get data from the frontend's request
    data = request.get_json()

    # In a real scenario, you'd get features for the stock ticker from `data`
    # For this example, we'll just predict on the first test sample
    # as the provided dataset isn't based on real-time tickers.
    prediction_input = x_test[0].reshape(1, -1)
    predicted_price = model.predict(prediction_input)

    # Prepare the response to send back to the frontend
    response = {
        'ticker': data.get('ticker', 'UNKNOWN'),
        'predictedPrice': predicted_price[0],
        'r2Score': 86.64,  # From your previous results
        'rmse': 2.36     # From your previous results
    }

    return jsonify(response)

# Run the server
if __name__ == '__main__':
    app.run(port=5001, debug=True)
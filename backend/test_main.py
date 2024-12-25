import random
import time
import requests

def send_value_to_endpoint(value):
    """Send a value to the endpoint as a POST request."""
    url = "http://localhost:8000/data"  # Replace with your actual endpoint
    payload = {"value": value}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise an error for HTTP codes 4xx/5xx
        print(f"Successfully sent value {value}: {response.status_code}")
    except requests.RequestException as e:
        print(f"Failed to send value {value}: {e}")

if __name__ == "__main__":
    while True:
        random_value = round(random.uniform(0, 45), 1)
        send_value_to_endpoint(random_value)
        time.sleep(2)  # Wait for 2 seconds before sending the next value


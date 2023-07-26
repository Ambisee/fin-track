### FinTrack

This application allows user to write down their daily incomes and expenses and functions to store them in a concise way
for easy access and edit. This application also provides a feature to send a monthly reports based on what is written to
specified users' email addresses.

### Technologies
We will be using Firebase mainly to provide backend support for authentication and data storage.

For the code that we will be writing, we will be using NodeJS and NextJS to provide a web interface for the user to interact with the application and Django to handle the rendering and sending of monthly reports.

More specifically:
- Frontend:
    - **NodeJS** and **NextJS** will handle serving the interface to our clients. 
      We will also use additional NodeJS libraries:
        - **Firebase Javascript SDK** to allow our client to communicate with Firebase.
        - **React Query** to handle retrieving data from Firebase.
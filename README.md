### FinTrack

This application allows user to write down their daily incomes and expenses and functions to store them in a concise way
for easy access and edit. This application also provides a feature to send a monthly reports based on what is written to
specified users' email addresses.

### Technologies
We are using Supabase, a Backend-as-a-Service to provide user authentication and data storage for the application.

For the code that we will be writing, we will be using NodeJS and NextJS to provide a web interface for the user to interact with the application and Django to handle the rendering and sending of monthly reports.

More specifically:
- Frontend:
    - **NodeJS** and **NextJS** will handle serving the interface to our clients. 
      We will also use additional NodeJS libraries:
        - **Supabase Javascript SDK** to allow our client to communicate with Firebase. 
        - **React Hook Form** to provide client-side data validation when users interact with form fields.

- Backend:
    - **Supabase** will act as the server that our user interface will interact with to provide user authentication
        and serves as a data store to store all of the user's data.
    - **Django** will handle the calculations, generations, and deliveries of the monthly reports of each users.
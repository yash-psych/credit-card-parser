"# Credit Card Statement Parser" 


This a credit card parser which helps to parse credit card statements of five credit card issuers as follows:
1. Axis bank
2. HDFC
3. ICICI
4. State Bank of India|SBI
5. American Express|AMEX


& on the following datapoints
        {
        issuer name,
        last_4_digits,
        card_variant,
        billing_cycle,
        payment_due_date,
        total_balance
        }


Installation & Usage

Prerequisites:
            Python 
            Node.js
            GPL Ghostscripts
            Tesseract-OCR 


Setup: To get started with the credit card parser, follow these steps:

1. Clone the Repository:

        git clone https://github.com/yash-psych/credit-card-parser.git
        cd credit-card-parser


2. Install Dependencies:

         - Frontend:
                     cd frontend
                     npm install
                     pip install tailwindcss (maybe needed for some users)

         - Backend:
                    cd backend
                    pip install -r requirements.txt
                    python setup.py username password(for super_admin creation)


3. Run the Application: 
        cd..
        npm run dev (no need to run both scripts together already include concurrent script excusion )


About the project:-

I have implemented a login page for both user and admin, also a script for super_admin creation has been included. The scipt uses OCR to extract data points. i have aslo include a option where all the previous extracts will be present and can be segregated by issuer name and time and data can be exported in pdf, excel or document for further integration or processing. All the passwords, uploaded and extracted data has been hashed ensuring maximum securtiy. Also the adim panel can verify, reset password, suspend or Promote/ demote user to admin and vice versa.

My main motive while cretaing this solution was to create a parser which actual takes secure approach and implement a secure system.
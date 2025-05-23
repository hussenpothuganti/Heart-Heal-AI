# Heart Heal AI - Deployment and User Guide

## Overview

Heart Heal AI is a complete web application designed to help users heal from love failures through AI-powered conversations and music recommendations. The application features:

- Login page with soothing background music
- Email-based authentication with conversation memory
- Gender-adaptive AI responses (boyfriend-like for female users, girlfriend-like for male users)
- YouTube song recommendations based on emotional context
- Clean, modern interface similar to ChatGPT

## Deployment Instructions

### Option 1: Deploy to a Web Hosting Service (Recommended)

1. **Choose a hosting provider** that supports Python Flask applications:
   - [Heroku](https://www.heroku.com/)
   - [PythonAnywhere](https://www.pythonanywhere.com/)
   - [DigitalOcean](https://www.digitalocean.com/)
   - [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)

2. **Prepare your application**:
   - Ensure the `requirements.txt` file is up to date:
     ```
     cd /path/to/heart_heal_ai
     source venv/bin/activate
     pip freeze > requirements.txt
     ```

3. **Set up environment variables** on your hosting provider:
   - `SECRET_KEY`: A random string for Flask session security
   - `JWT_SECRET_KEY`: A random string for JWT token security
   - `DATABASE_URL`: Your database connection string (if using external database)

4. **Deploy the application** following your hosting provider's instructions.
   - For Heroku, you would use:
     ```
     git init
     git add .
     git commit -m "Initial commit"
     heroku create heart-heal-ai
     git push heroku master
     ```

### Option 2: Self-Hosting on a VPS

1. **Set up a Virtual Private Server** (VPS) with Ubuntu:
   - [DigitalOcean](https://www.digitalocean.com/)
   - [Linode](https://www.linode.com/)
   - [AWS EC2](https://aws.amazon.com/ec2/)

2. **Install required packages**:
   ```
   sudo apt update
   sudo apt install -y python3-pip python3-venv nginx
   ```

3. **Clone or upload the application**:
   ```
   git clone [your-repository-url] /var/www/heart_heal_ai
   cd /var/www/heart_heal_ai
   ```

4. **Set up the Python environment**:
   ```
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   ```

5. **Create a systemd service** to run the application:
   ```
   sudo nano /etc/systemd/system/heart_heal_ai.service
   ```
   
   Add the following content:
   ```
   [Unit]
   Description=Heart Heal AI
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/heart_heal_ai
   Environment="PATH=/var/www/heart_heal_ai/venv/bin"
   ExecStart=/var/www/heart_heal_ai/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 -m 007 src.main:app

   [Install]
   WantedBy=multi-user.target
   ```

6. **Configure Nginx** as a reverse proxy:
   ```
   sudo nano /etc/nginx/sites-available/heart_heal_ai
   ```
   
   Add the following content:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

7. **Enable the site and restart services**:
   ```
   sudo ln -s /etc/nginx/sites-available/heart_heal_ai /etc/nginx/sites-enabled
   sudo systemctl start heart_heal_ai
   sudo systemctl enable heart_heal_ai
   sudo systemctl restart nginx
   ```

8. **Set up SSL** with Let's Encrypt for secure HTTPS:
   ```
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## User Guide

### Admin Setup

1. **First-time setup**:
   - Access the application at your domain
   - Create the first admin account by registering at `/admin/register` (this route is only available when no users exist)
   - Use this admin account to manage the application

2. **Customizing the AI**:
   - The AI responses are configured in `src/routes/chat.py`
   - Song recommendations can be updated in the `SONG_RECOMMENDATIONS` list
   - Gender-specific responses can be adjusted in the response generation logic

### User Experience

1. **Login Page**:
   - Background music plays automatically (can be toggled)
   - Users can register with email and password
   - Returning users can log in with their credentials

2. **Chat Interface**:
   - Users are greeted with a personalized welcome message
   - AI responds with empathetic messages based on user input
   - When users discuss heartbreak or request music, the AI suggests relevant songs with YouTube links
   - Conversations are saved and can be continued later

3. **User Settings**:
   - Users can update their profile information, including gender
   - Password reset functionality is available via the "Forgot password" link

## Maintenance

1. **Database Backup**:
   - Regularly backup the SQLite database file:
     ```
     cp /path/to/heart_heal_ai/instance/heart_heal.db /path/to/backup/heart_heal_$(date +%Y%m%d).db
     ```

2. **Updating the Application**:
   - Pull the latest changes or upload new files
   - Restart the application:
     ```
     sudo systemctl restart heart_heal_ai
     ```

3. **Monitoring**:
   - Check application logs:
     ```
     sudo journalctl -u heart_heal_ai
     ```

## Troubleshooting

1. **Application not starting**:
   - Check logs: `sudo journalctl -u heart_heal_ai`
   - Verify environment variables are set correctly
   - Ensure database file is writable by the application user

2. **Login issues**:
   - Reset the database if needed (caution: this deletes all user data):
     ```
     rm /path/to/heart_heal_ai/instance/heart_heal.db
     ```
   - Restart the application to recreate the database

3. **Song recommendations not appearing**:
   - Check the `chat.py` file to ensure the song recommendation logic is working
   - Verify that user messages contain keywords that trigger recommendations

## Contact Support

If you encounter any issues or need assistance with your Heart Heal AI deployment, please contact:

- Email: support@heartheai.example.com
- Website: https://heartheai.example.com/support

---

Thank you for choosing Heart Heal AI to help users heal from love failures. We hope this application brings comfort and support to those in need.

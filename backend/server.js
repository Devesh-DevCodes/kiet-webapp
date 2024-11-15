const express = require("express");
const puppeteer = require('puppeteer');
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors({
    origin: '*',  // Frontend URL
    // origin: 'https://kiet-webapp.vercel.app',  // Frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let browser, page;

// Function to launch the browser and log in
async function launchBrowserAndLogin(username, password) {
    console.log('Puppeteer executable path:', puppeteer.executablePath());
    const browser = await puppeteer.launch({
        headless: true, // Set headless mode to true for production
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Fixes issues on certain environments
          '--disable-gpu',            // Disable GPU for headless environments
        ]
      });
    page = await browser.newPage();

    const loginUrl = "https://mserp.kiet.edu/Academic/iitmsPFkXjz+EbtRodaXHXaPVt3dlW3oTGB+3i1YZ7alodHeRzGm9eTr2C53AU6tMBXuOXVbvNfePRUcHp4rLz3edhg==?enc=3Q2Y1k5BriJsFcxTY7ebQh0hExMANhAKSl1CmxvOF+Y=";
    await page.goto(loginUrl);

    await page.type('#txt_username', username);
    await page.type('#txt_password', password);

    // Manually solve CAPTCHA
    // console.log("Please solve the CAPTCHA manually, then press Enter in the console...");
    // await new Promise(resolve => process.stdin.once('data', resolve));

    // console.log("Please solve the CAPTCHA manually, wait for 10 sec ...");
    // await new Promise(resolve => setTimeout(resolve, 10000));
    // console.log("Delay finished, resuming...");


     // Retrieve CAPTCHA value from hidden input and fill it in automatically
     const captchaValue = await page.$eval('#hdncaptcha', el => el.value);
     await page.type('#txtcaptcha', captchaValue);  // Fill the CAPTCHA field with the retrieved value
 
     await page.click('#btnLogin');
     await page.waitForNavigation();
 
     // Do further actions after login if needed
     console.log("Logged in successfully!");

}

// Function to fetch attendance data
async function fetchAttendanceData() {
    const attendanceUrl = "https://mserp.kiet.edu/Academic/iitmsPFkXjz+EbtRodaXHXaPVt3dlW3oTGB+3i1YZ7alodHeRzGm9eTr2C53AU6tMBXuOXVbvNfePRUcHp4rLz3edhg==?enc=3Q2Y1k5BriJsFcxTY7ebQh0hExMANhAKSl1CmxvOF+Y=";
    await page.goto(attendanceUrl);

    await page.waitForSelector("#ctl00_ContentPlaceHolder1_UpdatePanel3");
    const attendanceData = await page.evaluate(() => {
        const rows = document.querySelectorAll("#ctl00_ContentPlaceHolder1_UpdatePanel3 tr");
        return Array.from(rows).map(row => {
            const columns = row.querySelectorAll("td");
            return {
                courseCode: columns[0]?.innerText.trim(),
                courseName: columns[1]?.innerText.trim(),
                subjectType: columns[2]?.innerText.trim(),
                totalClasses: columns[3]?.innerText.trim(),
                totalPresent: columns[4]?.innerText.trim(),
                attendancePercentage: columns[5]?.innerText.trim(),
            };
        });
    });

    console.log("fetched attendance ");
    fs.writeFileSync("attendanceData.json", JSON.stringify(attendanceData, null, 2));
    return attendanceData;
}

// Function to fetch marks data
async function fetchMarksData() {
    const marksUrl = "https://mserp.kiet.edu/Academic/iitmsPFkXjz+EbtRodaXHXaPVt3dlW3oTGB+3i1YZ7alodHeRzGm9eTr2C53AU6tMBXuOXVbvNfePRUcHp4rLz3edhg==?enc=3Q2Y1k5BriJsFcxTY7ebQh0hExMANhAKSl1CmxvOF+Y=";
    await page.goto(marksUrl);

    await page.waitForSelector("#my-table");
    const marksData = await page.evaluate(() => {
        const rows = document.querySelectorAll("#my-table tbody tr");
        return Array.from(rows).map(row => {
            const columns = row.querySelectorAll("td");
            return {
                courseCode: columns[0]?.innerText.trim(),
                courseName: columns[1]?.innerText.trim(),
                subjectType: columns[2]?.innerText.trim(),
                CA_I: columns[3]?.innerText.trim(),
                CA_II: columns[4]?.innerText.trim(),
                CA_III: columns[5]?.innerText.trim(),
                CA_IV: columns[6]?.innerText.trim(),
                attendance: columns[7]?.innerText.trim(),
                PCA_I: columns[8]?.innerText.trim(),
                PCA_II: columns[9]?.innerText.trim(),
            };
        });
    });

    console.log("fetched marks");
    fs.writeFileSync("marksData.json", JSON.stringify(marksData, null, 2));
    return marksData;
}

// Route to handle login and fetch both attendance and marks data
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        try {
            // Launch browser and log in once
            await launchBrowserAndLogin(username, password);

            // Fetch both attendance and marks data
            const attendanceData = await fetchAttendanceData();
            const marksData = await fetchMarksData();

            // Close the browser after fetching both data
            await browser.close();  // automatically closes erp page after fetching data

            // Send both attendance and marks data in the response
            res.json({
                success: true,
                attendanceData,
                marksData,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error fetching data" });
        }
    } else {
        res.status(400).json({ success: false, message: "Username and password are required" });
    }
});


// Serve index.html as the main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Serve attendance data as JSON
app.get("/api/attendance", (req, res) => {
    fs.readFile('attendanceData.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ success: false, message: "Error reading attendance data" });
        } else {
            res.json({ success: true, attendanceData: JSON.parse(data) });
        }
    });
});

// Serve marks data as JSON
app.get("/api/marks", (req, res) => {
    fs.readFile('marksData.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ success: false, message: "Error reading marks data" });
        } else {
            res.json({ success: true, marksData: JSON.parse(data) });
        }
    });
});

// Serve attendance page (you may need to create this page)
app.get("/attendance.html", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'attendance.html'));
});

// Serve marks page (you may need to create this page)
app.get("/marks.html", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'marks.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

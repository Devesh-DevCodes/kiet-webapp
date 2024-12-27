

    window.addEventListener('DOMContentLoaded', async () => {
        try {
            // Fetch attendance data
            const response = await fetch('/api/attendance');
            if (!response.ok) {
                throw new Error('Failed to load attendance data');
            }
            
            const { attendanceData } = await response.json();
            displayAttendance(attendanceData);
            calculateTotalAttendance(attendanceData); // Call the function with attendance data
        } catch (error) {
            console.error('Error loading attendance data:', error);
            const tableBody = document.querySelector('#attendanceTable tbody');
            tableBody.innerHTML = '<tr><td colspan="6">Failed to load attendance data. Please try again later.</td></tr>';
        }

        // Handle the "View Marks" button
        const viewMarksBtn = document.getElementById('viewMarksBtn');
        viewMarksBtn.addEventListener('click', function () {
            window.location.href = '/marks.html';  // Redirect to marks page
        });

        // Handle the "back to login" button
        document.getElementById('checkOtherDetailsBtn').addEventListener('click', () => {
            window.location.href = '/index.html'; // Adjust path if needed
        });
        
    });
    
    // Function to display attendance data in the table
    function displayAttendance(attendanceData) {
        const tableBody = document.querySelector('#attendanceTable tbody');
        tableBody.innerHTML = '';
        
        attendanceData.forEach(attendance => {
            const row = document.createElement('tr');
            Object.values(attendance).forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    }
    
    // Function to calculate total attendance percentage
    function calculateTotalAttendance(attendanceData) {
        let totalClasses = 0;
        let totalPresent = 0;
        let totalOD = 0;
        
        attendanceData.forEach(course => {
            const classes = parseInt(course.totalClasses);
            const present = parseInt(course.totalPresent);
            const od = parseInt(course.totalOD);
    
            // Accumulate total classes and total present values
            if (!isNaN(classes) && !isNaN(present)) {
                totalClasses += classes;
                totalPresent += present;
                totalOD += od;
            }
        });
    
        // Calculate total attendance percentage
        const totalAttendancePercentage = (totalPresent / totalClasses) * 100;
        const finalAttendancePercentage = ((totalPresent+totalOD) / totalClasses) * 100;
    
        // Display total attendance in the "totalAttendance" element
        document.getElementById('totalAttendance').innerHTML = 
            `
            Total Present: ${totalPresent}<hr style="border: .7px solid; width: 12%; margin:0 auto">
            Total Classes: ${totalClasses}<br><hr style="border: 1px dotted ; width: 15%; margin-bottom: 0px"><hr style="border: 1px dotted; width: 15%; margin-top: 2px">
            Total Attendance: ${totalAttendancePercentage.toFixed(2)}% <br>
            Total OD: ${totalOD}<hr style="border: 1px dotted ; width: 15%; margin-bottom: 0px"><hr style="border: 1px dotted; width: 15%; margin-top: 2px">
            Final Attendance: ${finalAttendancePercentage.toFixed(2)}% <br>
            
            `;
    }
    

// script.js
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the marks data from the server (assuming /api/marks is available)
        const response = await fetch('/api/marks');
        
        if (!response.ok) {
            throw new Error('Failed to fetch marks data');
        }
        
        const data = await response.json();  // This should return the response object, which includes marksData

        // Access marksData from the response object
        const marksData = data.marksData;

        // Log the data to check its format
        console.log(marksData);
        
        // Ensure marksData is an array before proceeding
        if (Array.isArray(marksData)) {
            // Get the table body element
            const tableBody = document.querySelector('#marksTable tbody');
            
            // Clear any existing rows (in case of previous data)
            tableBody.innerHTML = '';
            
            // Loop through the marks data and add it to the table
            marksData.forEach(mark => {
                const row = document.createElement('tr');
                
                // Create a table cell for each property of the mark object
                Object.values(mark).forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                });
                
                // Append the new row to the table body
                tableBody.appendChild(row);
            });
        } else {
            throw new Error('Marks data is not an array');
        }
    } catch (error) {
        console.error('Error loading marks data:', error);
        
        // Optionally, display an error message to the user
        const tableBody = document.querySelector('#marksTable tbody');
        tableBody.innerHTML = '<tr><td colspan="10">Failed to load marks data. Please try again later.</td></tr>';
    }
});


require("./db");
const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
const { signin, form, head_cat, sub_cat, month, department, vehicle, employee, fy_year } = require('./schema');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

const app = express();

app.use(cors());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(express.static('public'));


// Signin process
app.post('/signin', async (req, res) => {
    try {
        const user = req.body.username;
        const pass = req.body.password;
        const preuser = await signin.findOne({ '$and': [{ "username": { '$eq': user } }, { "password": { '$eq': pass } }] });
        if (preuser) {
            const cred = {
                "username": user,
                "password": pass
            };
            res.json(cred);
        } else {
            res.json({ "message": "error" });
        }
    } catch (err) {
        res.status(500).json({ "error": err });
    }
});

// Post form with file upload and PDF merging
// Ensure directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Ensure the upload and merged PDFs directories exist
ensureDir(path.join(__dirname, 'public', 'pdf'));
ensureDir(path.join(__dirname, 'public', 'merged_pdfs'));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'pdf'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const bill_no = req.body.bill_no || 'unknown';
        const date = req.body.date || new Date().toISOString().split('T')[0];
        const randomNumber = Math.floor(Math.random() * 1000);
        cb(null, `${bill_no}_${date}_${randomNumber}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Function to merge PDF files
// Utility function to add an image as a page in the PDF


// Utility function to add an image as a page in the PDF
const addImageToPdf = async (pdfDoc, imageBuffer, extension) => {
    try {
        let image;
        switch (extension) {
            case '.png':
                image = await pdfDoc.embedPng(imageBuffer);
                break;
            case '.jpg':
            case '.jpeg':
                image = await pdfDoc.embedJpg(imageBuffer);
                break;
            default:
                throw new Error(`Unsupported image type: ${extension}`);
        }

        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
        });
    } catch (error) {
        console.error('Error adding image to PDF:', error);
        throw error;
    }
};

// Updated function to merge files
const mergeFilesToPdf = async (files, outputPath) => {
    try {
        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
            const filePath = path.join(__dirname, 'public', 'pdf', file.filename);
            console.log(`Processing file: ${filePath}`);
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                throw new Error(`File not found: ${filePath}`);
            }

            const fileBuffer = fs.readFileSync(filePath);
            const ext = path.extname(file.filename).toLowerCase();

            if (ext === '.pdf') {
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => pdfDoc.addPage(page));
            } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                await addImageToPdf(pdfDoc, fileBuffer, ext);
            } else {
                console.error(`Unsupported file type: ${ext}`);
                throw new Error(`Unsupported file type: ${ext}`);
            }
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        console.log(`PDF saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error merging files:', error);
        throw error;
    }
};



// Post form with file upload and PDF merging
// Post form with file upload and PDF merging
app.post('/postform', upload.array('files'), async (req, res) => {
    try {
        console.log('Files received:', req.files);

        // Extract and parse form fields from req.body
        const { fy_year, month, head_cat, sub_cat, date, received_by, particulars, bill_no, departments, amount, vehicles } = req.body;

        // Convert JSON strings back to objects
        const parsedHeadCat = JSON.parse(head_cat || '[]');
        const parsedSubCat = JSON.parse(sub_cat || '[]');
        const parsedReceivedBy = JSON.parse(received_by || '[]');
        const parsedDepartments = JSON.parse(departments || '[]');
        const parsedVehicles = JSON.parse(vehicles || '[]');

        // Generate output file name
        const billNumber = bill_no || 'unknown';
        const todayDate = date || new Date().toISOString().split('T')[0];
        const randomNumber = Math.floor(Math.random() * 1000);
        const outputFileName = `${billNumber}_${todayDate}_${randomNumber}.pdf`;
        const outputPath = path.join(__dirname, 'public', 'merged_pdfs', outputFileName);

        // Process files (e.g., merge PDFs)
        await mergeFilesToPdf(req.files, outputPath);

        // Delete the individual files after merging
        for (const file of req.files) {
            const filePath = path.join(__dirname, 'public', 'pdf', file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Save form data along with the output file name
        const newForm = new form({
            fy_year,
            month,
            head_cat: parsedHeadCat,
            sub_cat: parsedSubCat,
            date,
            received_by: parsedReceivedBy,
            particulars,
            bill_no,
            departments: parsedDepartments,
            amount,
            vehicles: parsedVehicles,
            files: outputFileName
        });

        await newForm.save();
        res.json({ message: `${fy_year} has been added` });
        console.log(newForm);
    } catch (error) {
        console.error('Error saving form:', error);
        res.status(500).json({ error: 'Failed to add form' });
    }
});




// Get forms
app.get('/getforms', async (req, res) => {
    try {
        const data = await form.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

// Get form by various filters
app.get('/amount/:given', async (req, res) => {
    try {
        const found = await form.find({ "amount": { '$eq': req.params.given } });
        res.json(found);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/particulars/:given', async (req, res) => {
    try {
        const found = await form.find({ "particulars": { '$eq': req.params.given } });
        res.json(found);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/fy_year/:given', async (req, res) => {
    try {
        const found = await form.find({ "fy_year": { '$eq': req.params.given } });
        res.json(found);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/month/:given', async (req, res) => {
    try {
        const found = await form.find({ "month": { '$eq': req.params.given } });
        res.json(found);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/date/:given', async (req, res) => {
    try {
        const found = await form.find({ "date": { '$eq': req.params.given } });
        res.json(found);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/getFormByHeadCatName/:head_cat_name', async (req, res) => {
    try {
        const forms = await form.find({
            'head_cat.head_cat_name': req.params.head_cat_name,
        });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/getFormBySubCatName/:sub_cat_name', async (req, res) => {
    try {
        const forms = await form.find({
            'sub_cat.sub_cat_name': req.params.sub_cat_name,
        });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/getFormByVehicleID/:vehicle_id', async (req, res) => {
    try {
        const vehicleId = Number(req.params.vehicle_id);
        const forms = await form.find({
            'vehicles.vehicle_id': vehicleId,
        });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

app.get('/getFormByEmployeeID/:emp_id', async (req, res) => {
    try {
        const empID = Number(req.params.emp_id);
        const forms = await form.find({
            'received_by.emp_id': empID,
        });
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve forms' });
    }
});

// Get head category
app.get('/gethead_cat', async (req, res) => {
    try {
        const data = await head_cat.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve head_cat' });
    }
});

// Get sub category
app.get('/getsub_cat', async (req, res) => {
    try {
        const data = await sub_cat.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve sub_cat' });
    }
});

// Get month
app.get('/getmonth', async (req, res) => {
    try {
        const data = await month.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve month' });
    }
});

// Get department
app.get('/getdepartment', async (req, res) => {
    try {
        const data = await department.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve department' });
    }
});

// Get employee
app.get('/getemployee', async (req, res) => {
    try {
        const data = await employee.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve employee' });
    }
});

// Get vehicle
app.get('/getvehicle', async (req, res) => {
    try {
        const data = await vehicle.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve vehicle' });
    }
});

// Get financial year
app.get('/getfy_year', async (req, res) => {
    try {
        const fy_year_data = await fy_year.find();
        res.json(fy_year_data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve fy_year' });
    }
});

app.listen(1111, () => {
    console.log("Express connected!!!");
});
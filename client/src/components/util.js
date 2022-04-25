import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import aws from 'aws-sdk';

const s3Config = {
    "region": "us-west-1",
    "accessKeyId": process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    "bucketName": "cmpe-273-etsy-clone"
}

const s3 = new aws.S3({
    region: s3Config.region,
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
    signatureVersion: 'v4'
})

export async function uploadToS3(file) {
    let imageExtension = file.name.split('.').pop();
    let imageName = uuidv4() + '.' + imageExtension;
    const params = {
        Bucket: s3Config.bucketName,
        Key: imageName,
        Expires: 60,
        ContentType: 'image/*'
    };
    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    await fetch(uploadURL, {
        method: "PUT",
        headers: {
            "Content-Type": 'image/*',
        },
        body: file
    })
    return uploadURL.split('?')[0];
};

export function isLoggedIn() {
    return cookie.load('access-token');
};

export const backendServer = "http://54.183.218.17:4000";

export function getCurrencySymbol(currency) {
    let currencySymbol = "";
    switch (currency) {
        case 'USD':
            currencySymbol = "$";
            break;
        case 'INR':
            currencySymbol = "₹";
            break;
        case 'EUR':
            currencySymbol = "€";
            break;
        case 'GBP':
            currencySymbol = "£";
            break;
        case 'JPY':
            currencySymbol = "¥";
            break;
        default:
            currencySymbol = "$";
    }
    return currencySymbol;
};

export const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Deps", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Rep", "Chad", "Chile",
    "China", "Colombia", "Comoros", "Congo", "Congo {Democratic Rep}", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland {Republic}", "Israel",
    "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North",
    "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
    "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "{Burma}", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau",
    "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russian Federation", "Rwanda", "St Kitts & Nevis", "St Lucia", "Saint Vincent & the Grenadines", "Samoa",
    "San Marino", "Sao Tome & Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
    "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain",
    "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
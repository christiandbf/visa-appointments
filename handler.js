const playwright = require('playwright-aws-lambda');
const AWS = require('aws-sdk');

const { URL, PHONE_NUMBERS } = process.env;

const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// eslint-disable-next-line no-unused-vars
module.exports.run = async (event, context) => {
  const date = new Date();

  const browser = await playwright.launchChromium();
  const page = await browser.newPage();
  await page.goto(URL);

  await page
    .locator('a', { hasText: 'citas previas' })
    .evaluate((node) => node.removeAttribute('target'));
  await page.locator('a', { hasText: 'citas previas' }).click();
  await page.locator('a', { hasText: 'visados' }).click();
  await page.waitForLoadState('networkidle');

  const nearestDateAvailable = await page
    .locator('#idDivBktDatetimeSelectedDate')
    .textContent();

  const buffer = await page.screenshot();

  const s3Object = await s3
    .upload({
      Bucket: process.env.S3_BUCKET,
      Key: `${date.toISOString()}.png`,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read',
    })
    .promise();

  const message = `The nearest available date for spanish visa is: ${nearestDateAvailable}. ${s3Object.Location}`;

  const notifications = PHONE_NUMBERS
    .split(',')
    .map((phoneNumber) => ({
      Message: message,
      PhoneNumber: phoneNumber,
    }))
    .map((notification) => sns.publish(notification).promise());

  await Promise.all(notifications);

  await browser.close();
};

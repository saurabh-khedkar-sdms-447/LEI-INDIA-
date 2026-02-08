# Admin Panel User Guide

This guide will help you manage your website content through the admin panel. You can update products, manage orders, create blog posts, and much more—all without needing technical knowledge.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Products Management](#products-management)
4. [Categories Management](#categories-management)
5. [Orders Management](#orders-management)
6. [Inquiries Management](#inquiries-management)
7. [Hero Slider Management](#hero-slider-management)
8. [Blogs Management](#blogs-management)
9. [Careers Management](#careers-management)
10. [Contact Information](#contact-information)
11. [Authorised Distributors](#authorised-distributors)
12. [Principal Partners](#principal-partners)
13. [About Us Content](#about-us-content)
14. [Technical Support Content](#technical-support-content)
15. [Company Policies](#company-policies)
16. [Returns Content](#returns-content)
17. [Technical Details](#technical-details)
18. [Best Practices](#best-practices)

---

## Getting Started

### Logging In

1. Navigate to the admin login page: `/admin/login`
2. Enter your **username** and **password**
3. Click **"Sign In"**
4. You will be redirected to the Dashboard upon successful login

**Note:** If you forget your password or encounter login issues, contact your system administrator.

### Session Management

- Your session remains active for **8 hours** after login
- If you're inactive for a long time, you may need to log in again
- Always click **"Logout"** when finished to secure your account

---

## Dashboard Overview

The Dashboard provides a quick overview of your website's activity:

- **Total Products**: Number of products in your catalog
- **Total Orders**: All customer orders (pending, quoted, approved, rejected)
- **Total Inquiries**: Customer inquiries received
- **Pending Orders**: Orders awaiting your action
- **Pending Inquiries**: Inquiries that need a response

**Quick Actions** allow you to quickly navigate to:
- Manage Products
- View Orders
- View Inquiries

**Recent Activity** shows the latest orders and inquiries for quick access.

---

## Products Management

### Viewing Products

1. Click **"Products"** in the left sidebar
2. You'll see a table listing all products with:
   - Product description
   - MPN (Manufacturer Part Number)
   - Category
   - Connector type
   - Actions (Edit/Delete)

### Adding a New Product

1. Click the **"Add Product"** button
2. Fill in the product form:

   **Required Fields:**
   - **Description**: Product name/description (e.g., "M12 4-Pin Male Connector IP67")

   **Optional Fields:**
   - **MPN**: Manufacturer Part Number
   - **Category**: Select from existing categories
   - **Product Type**: Type of product (e.g., "Connector")
   - **Connector Type**: M12, M8, or RJ45
   - **Code**: A, B, D, or X
   - **Degree of Protection**: IP67, IP68, or IP20
   - **Technical Specifications**: Wire cross section, temperature range, cable diameter, etc.
   - **Images**: Upload product images (URLs)
   - **Documents**: Add datasheets, drawings, or other documents

3. Click **"Save"** to create the product

### Editing a Product

1. Find the product in the list
2. Click the **"Edit"** icon (pencil) next to the product
3. Modify any fields as needed
4. Click **"Save"** to update

### Deleting a Product

1. Find the product in the list
2. Click the **"Delete"** icon (trash) next to the product
3. Confirm the deletion in the popup dialog

**Warning:** Deleting a product is permanent and cannot be undone.

### Uploading Images

1. In the product form, click **"Upload Image"**
2. Enter the image URL (must be a valid web address)
3. Click **"Add Image"** to add it to the product
4. You can add multiple images
5. Remove images by clicking the **"X"** button on each image

### Adding Documents

1. In the product form, scroll to the **"Documents"** section
2. Click **"Upload Document"**
3. Enter:
   - **Document URL**: Web address of the document
   - **Filename**: Name of the file (e.g., "datasheet.pdf")
   - **Size** (optional): File size in bytes
4. Click **"Add Document"**
5. You can add multiple documents

---

## Categories Management

### Viewing Categories

1. Click **"Categories"** in the left sidebar
2. You'll see all product categories in a table

### Adding a New Category

1. Click the **"Add Category"** button
2. Fill in the form:
   - **Name**: Category name (e.g., "M12 Connectors")
   - **Slug**: URL-friendly identifier (auto-generated from name, but can be edited)
   - **Description**: Optional description of the category
   - **Image**: Optional category image URL
   - **Parent Category**: Optional - select a parent category to create hierarchies
3. Click **"Save"**

### Editing a Category

1. Find the category in the list
2. Click the **"Edit"** icon
3. Modify fields as needed
4. Click **"Save"**

### Deleting a Category

1. Find the category in the list
2. Click the **"Delete"** icon
3. Confirm deletion

**Note:** Categories with products cannot be deleted. Remove or reassign products first.

---

## Orders Management

### Viewing Orders

1. Click **"Orders"** in the left sidebar
2. You'll see all customer orders (RFQs - Request for Quotation)

### Filtering Orders

Use the status filter dropdown to view:
- **All Orders**: Every order regardless of status
- **Pending**: Orders awaiting your response
- **Quoted**: Orders for which you've provided a quote
- **Approved**: Orders approved by customers
- **Rejected**: Orders that were rejected

### Viewing Order Details

1. Click the **"View"** icon (eye) next to any order
2. The order details dialog shows:
   - Customer information (company name, contact, email, phone)
   - Order items (products, quantities, SKUs)
   - Order status
   - Notes
   - Creation and update dates

### Updating Order Status

1. Open the order details dialog
2. Select a new status from the **"Status"** dropdown:
   - **Pending**: Initial state, awaiting action
   - **Quoted**: You've sent a quote to the customer
   - **Approved**: Customer approved the order
   - **Rejected**: Order was rejected
3. Optionally add **Notes** for internal tracking
4. Click **"Update Order"** to save

**Note:** Order status updates help you track the sales pipeline and customer communications.

---

## Inquiries Management

### Viewing Inquiries

1. Click **"Inquiries"** in the left sidebar
2. You'll see all customer inquiries in a table

### Inquiry Information

Each inquiry shows:
- Customer name and email
- Subject
- Message content
- Date received
- Status (read/unread)

### Managing Inquiries

- Click on an inquiry to view full details
- Mark inquiries as read/unread for tracking
- Use inquiries to identify sales opportunities and customer support needs

---

## Hero Slider Management

The Hero Slider displays images and content on your homepage.

### Viewing Hero Slides

1. Click **"Hero Slider"** in the left sidebar
2. You'll see all slides in a table

### Adding a New Slide

1. Click **"Add Slide"**
2. Fill in:
   - **Title**: Slide heading
   - **Subtitle**: Optional subtitle text
   - **Image URL**: Image to display
   - **Link URL**: Optional link when slide is clicked
   - **Order**: Display order (lower numbers appear first)
   - **Active**: Toggle to show/hide the slide
3. Click **"Save"**

### Editing a Slide

1. Find the slide in the list
2. Click **"Edit"**
3. Modify fields as needed
4. Click **"Save"**

### Deleting a Slide

1. Find the slide in the list
2. Click **"Delete"**
3. Confirm deletion

**Tip:** Keep slides active and well-ordered to create an engaging homepage experience.

---

## Blogs Management

### Viewing Blogs

1. Click **"Blogs"** in the left sidebar
2. You'll see all blog posts in a table with:
   - Title
   - Slug (URL identifier)
   - Published status
   - Creation date

### Adding a New Blog Post

1. Click **"Add Blog"**
2. Fill in the form:
   - **Title**: Blog post title
   - **Excerpt**: Short summary (optional)
   - **Content**: Full blog post content (supports rich text)
   - **Image URL**: Featured image (optional)
   - **Published**: Toggle to publish or save as draft
3. Click **"Save"**

**Note:** The slug is auto-generated from the title but can be edited.

### Editing a Blog Post

1. Find the blog post in the list
2. Click **"Edit"**
3. Modify content as needed
4. Click **"Save"**

### Deleting a Blog Post

1. Find the blog post in the list
2. Click **"Delete"**
3. Confirm deletion

**Tip:** Use the "Published" toggle to control when blog posts appear on your website.

---

## Careers Management

### Viewing Job Postings

1. Click **"Careers"** in the left sidebar
2. You'll see all job postings in a table

### Adding a New Job Posting

1. Click **"Add Career"**
2. Fill in the form:
   - **Title**: Job title (required)
   - **Department**: Department name (required)
   - **Location**: Job location (required)
   - **Type**: Employment type (e.g., Full-time, Part-time) (required)
   - **Description**: Job description (required)
   - **Requirements**: Required qualifications (optional)
   - **Responsibilities**: Job responsibilities (optional)
   - **Benefits**: Benefits offered (optional)
   - **Salary**: Salary information (optional)
   - **Active**: Toggle to show/hide the posting
3. Click **"Save"**

### Editing a Job Posting

1. Find the job posting in the list
2. Click **"Edit"**
3. Update information as needed
4. Click **"Save"**

### Deleting a Job Posting

1. Find the job posting in the list
2. Click **"Delete"**
3. Confirm deletion

**Tip:** Set "Active" to false to hide filled positions without deleting them.

---

## Contact Information

### Managing Contact Details

1. Click **"Contact Info"** in the left sidebar
2. View and edit your company's contact information:
   - Phone numbers
   - Email addresses
   - Physical addresses
   - Social media links
   - Business hours

### Updating Contact Information

1. Click **"Edit"** on any contact item
2. Update the fields
3. Click **"Save"**

**Note:** Contact information appears on your website's contact page and footer.

---

## Authorised Distributors

### Viewing Distributors

1. Click **"Authorised Distributors"** in the left sidebar
2. You'll see all authorised distributors in a table

### Adding a New Distributor

1. Click **"Add Distributor"**
2. Fill in:
   - **Company Name**: Distributor company name
   - **Logo URL**: Company logo image URL
   - **Contact Information**: Email, phone, address
   - **Website**: Company website URL
   - **Description**: Company details
   - **Active**: Toggle to show/hide on website
3. Click **"Save"**

### Editing a Distributor

1. Find the distributor in the list
2. Click **"Edit"**
3. Update information
4. Click **"Save"**

### Deleting a Distributor

1. Find the distributor in the list
2. Click **"Delete"**
3. Confirm deletion

---

## Principal Partners

### Viewing Partners

1. Click **"Principal Partners"** in the left sidebar
2. You'll see all principal partners in a table

### Adding a New Partner

1. Click **"Add Partner"**
2. Fill in:
   - **Company Name**: Partner company name
   - **Logo URL**: Company logo image URL
   - **Contact Information**: Email, phone, address
   - **Website**: Company website URL
   - **Company Details**: Description of the partnership
   - **Active**: Toggle to show/hide on website
3. Click **"Save"**

### Editing a Partner

1. Find the partner in the list
2. Click **"Edit"**
3. Update information
4. Click **"Save"**

### Deleting a Partner

1. Find the partner in the list
2. Click **"Delete"**
3. Confirm deletion

---

## About Us Content

### Managing About Us Sections

1. Click **"About Us"** in the left sidebar
2. You'll see all content sections for your About Us page

### Adding a New Section

1. Click **"Add Section"**
2. Fill in:
   - **Section**: Section identifier (e.g., "hero", "story", "mission", "vision")
   - **Title**: Section title (optional)
   - **Content**: Section content (supports rich text)
   - **Display Order**: Number to control section order (lower numbers appear first)
3. Click **"Save"**

### Editing a Section

1. Find the section in the list
2. Click **"Edit"**
3. Update content
4. Click **"Save"**

### Deleting a Section

1. Find the section in the list
2. Click **"Delete"**
3. Confirm deletion

**Tip:** Use display order to control how sections appear on your About Us page.

---

## Technical Support Content

### Managing Technical Support Sections

1. Click **"Technical Support"** in the left sidebar
2. You'll see all content sections for your Technical Support page

### Adding a New Section

1. Click **"Add Section"**
2. Fill in:
   - **Section**: Section identifier
   - **Title**: Section title (optional)
   - **Content**: Section content (supports rich text)
   - **Display Order**: Number to control section order
3. Click **"Save"**

### Editing a Section

1. Find the section in the list
2. Click **"Edit"**
3. Update content
4. Click **"Save"**

### Deleting a Section

1. Find the section in the list
2. Click **"Delete"**
3. Confirm deletion

---

## Company Policies

### Viewing Policies

1. Click **"Company Policies"** in the left sidebar
2. You'll see all company policies in a table

### Adding a New Policy

1. Click **"Add Policy"**
2. Fill in:
   - **Title**: Policy title
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **Content**: Policy content (supports rich text)
   - **Active**: Toggle to show/hide on website
3. Click **"Save"**

### Editing a Policy

1. Find the policy in the list
2. Click **"Edit"**
3. Update content
4. Click **"Save"**

### Deleting a Policy

1. Find the policy in the list
2. Click **"Delete"**
3. Confirm deletion

**Note:** Policies are accessible via their slug on your website (e.g., `/policies/privacy-policy`).

---

## Returns Content

### Managing Returns Page Sections

1. Click **"Returns"** in the left sidebar
2. You'll see all content sections for your Returns page

### Adding a New Section

1. Click **"Add Section"**
2. Fill in:
   - **Section**: Section identifier
   - **Title**: Section title (optional)
   - **Content**: Section content (supports rich text)
   - **Display Order**: Number to control section order
3. Click **"Save"**

### Editing a Section

1. Find the section in the list
2. Click **"Edit"**
3. Update content
4. Click **"Save"**

### Deleting a Section

1. Find the section in the list
2. Click **"Delete"**
3. Confirm deletion

---

## Technical Details

### Managing Product Technical Details

Technical Details allow you to add sales and technical information to products.

1. Click **"Technical Details"** in the left sidebar
2. You'll see all technical detail entries

### Adding Technical Details

1. Click **"Add Technical Detail"**
2. Fill in:
   - **Product**: Select the product from the dropdown
   - **Tab**: Choose "Sales" or "Technical"
   - **Title**: Detail title (optional)
   - **Content**: Technical detail content (supports rich text)
   - **Display Order**: Number to control order within the tab
3. Click **"Save"**

### Editing Technical Details

1. Find the technical detail in the list
2. Click **"Edit"**
3. Update information
4. Click **"Save"**

### Deleting Technical Details

1. Find the technical detail in the list
2. Click **"Delete"**
3. Confirm deletion

**Note:** Technical details appear in tabs on product detail pages, allowing customers to view sales information and technical specifications separately.

---

## Best Practices

### General Guidelines

1. **Save Frequently**: Click "Save" after making changes to avoid losing work
2. **Preview Changes**: Check your website after making updates to ensure everything displays correctly
3. **Use Descriptive Names**: Use clear, descriptive names for products, categories, and content
4. **Keep Content Updated**: Regularly update product information, blog posts, and company information
5. **Organize with Categories**: Use categories to help customers find products easily
6. **Image Quality**: Use high-quality images with appropriate file sizes for fast loading
7. **SEO-Friendly Content**: Write clear, descriptive content that helps with search engine optimization

### Product Management

- **Complete Product Information**: Fill in as many product fields as possible for better customer experience
- **Accurate Specifications**: Ensure technical specifications are accurate and up-to-date
- **Multiple Images**: Add multiple product images from different angles
- **Documentation**: Include datasheets and technical documents when available

### Content Management

- **Consistent Formatting**: Use consistent formatting across blog posts and content sections
- **Regular Updates**: Keep blog content fresh and relevant
- **Clear Structure**: Use display order to organize content sections logically
- **Active Status**: Use the "Active" toggle to control what appears on your website without deleting content

### Order Management

- **Quick Response**: Update order status promptly to keep customers informed
- **Clear Notes**: Add notes to orders for internal tracking and customer communication
- **Status Accuracy**: Keep order statuses accurate to track your sales pipeline

### Security

- **Logout When Done**: Always log out when finished using the admin panel
- **Secure Password**: Use a strong password and don't share your login credentials
- **Report Issues**: Contact your administrator if you notice any security concerns

---

## Troubleshooting

### Common Issues

**Can't log in:**
- Verify your username and password are correct
- Check if your account is active (contact administrator)
- Clear your browser cache and cookies, then try again

**Changes not appearing:**
- Ensure you clicked "Save" after making changes
- Check if the item is set to "Active"
- Clear your browser cache and refresh the page
- Wait a few moments for changes to propagate

**Images not displaying:**
- Verify image URLs are valid and accessible
- Ensure URLs start with `http://` or `https://`
- Check that images are publicly accessible (not behind authentication)

**Can't delete an item:**
- Some items cannot be deleted if they're referenced by other content (e.g., categories with products)
- Remove dependencies first, then try deleting again

**Form validation errors:**
- Check that all required fields are filled
- Verify field formats (e.g., email addresses, URLs)
- Ensure numeric fields contain valid numbers

### Getting Help

If you encounter issues not covered in this guide:
1. Check the error message for specific guidance
2. Contact your system administrator
3. Document the issue (what you were trying to do, what happened, error messages)

---

## Quick Reference

### Navigation Shortcuts

- **Dashboard**: Overview of activity
- **Products**: Manage product catalog
- **Categories**: Organize products
- **Orders**: View and manage customer orders
- **Inquiries**: Customer inquiries
- **Hero Slider**: Homepage slider images
- **Blogs**: Blog post management
- **Careers**: Job postings
- **Contact Info**: Company contact details
- **Authorised Distributors**: Distributor information
- **Principal Partners**: Partner information
- **About Us**: About page content
- **Technical Support**: Support page content
- **Company Policies**: Policy management
- **Returns**: Returns page content
- **Technical Details**: Product technical information

### Common Actions

- **Add**: Click the "Add" or "+" button
- **Edit**: Click the edit icon (pencil)
- **Delete**: Click the delete icon (trash), then confirm
- **Save**: Always click "Save" to apply changes
- **Cancel**: Click "Cancel" to discard changes

---

**Last Updated**: This guide covers all features available in the admin panel. For additional features or updates, contact your system administrator.

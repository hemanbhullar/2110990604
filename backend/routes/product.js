const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { accessCode } = require('../config/config');

async function fetchProductData(company, category, top, minPrice, maxPrice) {
  try {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products`, {
      params: {
        top,
        minPrice,
        maxPrice
      },
      headers: {
        'Authorization': `Bearer ${accessCode}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from company ${company}:`, error.message);
    return [];
  }
}

router.get('/:categoryname/products', async (req, res) => {
  const { categoryname } = req.params;
  let { top, minPrice, maxPrice } = req.query;

  top = parseInt(top); // Convert top to integer

  if (!Number.isInteger(top) || top <= 0) {
    return res.status(400).json({ msg: 'Invalid number of products requested' });
  }

  const companies = ["APIZ", "FLP", "SNP", "MYN", "AZO"];
  let products = [];

  for (const company of companies) {
    const companyProducts = await fetchProductData(company, categoryname, top, minPrice, maxPrice);
    products = products.concat(companyProducts.map(product => ({
      ...product,
      id: uuidv4(),
      company
    })));
  }

  res.json(products);
});

router.get('/:categoryname/products/:productid', async (req, res) => {
  const { categoryname, productid } = req.params;

  const companies = ["APIZ", "FLP", "SNP", "MYN", "AZO"];
  let product;

  for (const company of companies) {
    const products = await fetchProductData(company, categoryname, 100, 0, Number.MAX_VALUE); // Fetch a large number to ensure we get the product
    product = products.find(p => p.id === productid);
    if (product) {
      break;
    }
  }

  if (!product) {
    return res.status(404).json({ msg: 'Product not found' });
  }

  res.json(product);
});

module.exports = router;

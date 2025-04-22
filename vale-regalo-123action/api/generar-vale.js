const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Método no permitido');
    return;
  }

  try {
    const { nombre_cliente, num_acompanantes, numero_pedido } = req.body;

    const plantillaPath = path.join(__dirname, '../plantilla.html');
    let html = fs.readFileSync(plantillaPath, 'utf8');

    html = html
      .replace('{{nombre_cliente}}', nombre_cliente)
      .replace('{{num_acompanantes}}', num_acompanantes)
      .replace('{{numero_pedido}}', numero_pedido);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=\"vale-regalo.pdf\"');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar el vale:', error);
    res.status(500).send('Error al generar el vale');
  }
};

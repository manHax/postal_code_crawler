const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const baseURL = 'https://www.nomor.net/_kodepos.php';

async function crawlPage(url, data = []) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2' });

    // const rows = await page.$$eval('#table5 tbody tr', rows => {
    //     return rows.map(row => {
    //         const columns = row.querySelectorAll('td');
    //         return {
    //             no: columns[0].innerText.trim(),
    //             kodepos: columns[1].innerText.trim(),
    //             kelurahan: columns[2].innerText.trim(),
    //             kecamatan: columns[3].innerText.trim(),
    //             kabupaten: columns[4].innerText.trim(),
    //             propinsi: columns[5].innerText.trim()
    //         };
    //     });
    // });
    // Select the table using XPath
  const rows = await page.$x('/html/body/table/tbody/tr/td/table[2]/tbody/tr[2]/td/table/tbody/tr');

    data.push(...rows);

    const nextLink = await page.$eval('a.tpage[rel="nofollow"]:last-child', a => a.innerText.includes('halaman berikutnya') ? a.href : null);
    
    await browser.close();

    if (nextLink) {
        // Tambahkan jeda waktu untuk menghindari deteksi scraping
        await new Promise(resolve => setTimeout(resolve, 2000));
        return crawlPage(nextLink, data);
    } else {
        return data;
    }
}

async function writeCsv(data) {
    const csvWriter = createCsvWriter({
        path: 'kodepos_data.csv',
        header: [
            { id: 'no', title: 'No' },
            { id: 'kodepos', title: 'Kodepos' },
            { id: 'kelurahan', title: 'Kelurahan' },
            { id: 'kecamatan', title: 'Kecamatan' },
            { id: 'kabupaten', title: 'Kabupaten' },
            { id: 'propinsi', title: 'Propinsi' }
        ]
    });

    await csvWriter.writeRecords(data);
    console.log('Data successfully written to kodepos_data.csv');
}

async function main() {
    const initialUrl = `${baseURL}?_i=desa-kodepos&daerah=&jobs=&perhal=1000&sby=010000&asc=000101&urut=1`;
    const data = await crawlPage(initialUrl);
    await writeCsv(data);
}

main();

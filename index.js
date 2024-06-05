const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 'https://www.nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=1000&sby=010000&asc=000101&urut=1'

async function getRows(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Mengatur User-Agent untuk menghindari error 403
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // Membuka URL
    await page.goto(url, {
        waitUntil: 'load',
        timeout: 0
    });

    // Mengambil data dari tabel menggunakan XPath
    const data = await page.evaluate(() => {
        const rows = document.evaluate('/html/body/table/tbody/tr/td/table[2]/tbody/tr[2]/td/table/tbody/tr[2]/td/table[3]/tbody[2]/tr', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        const result = [];

        for (let i = 0; i < rows.snapshotLength; i++) {
            const row = rows.snapshotItem(i);
            const columns = row.querySelectorAll('td');
            const rowData = [];

            columns.forEach(column => {
                rowData.push(column.innerText.trim());
            });

            result.push(rowData);
        }

        return result;
    });
    await browser.close();

    return data;
}

(async () => {
    let allData = []
    let jumlahPage = 84
    let no1 = 1, no2 = 1000, kk = 2
    //   &no1=1&no2=1000&kk=2
    for (let index = 0; index < jumlahPage; index++) {
        if (index == 0) {
            urrr = 'https://www.nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=1000&sby=010000&asc=000101&urut=1'
        } else if (index == 1) {
            urrr = 'https://www.nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=1000&sby=010000&asc=000101&urut=1' + `&no1=${no1}&no2=${no2}&kk=${kk}`
        } else {
            no1 += 1000
            no2 += 1000
            kk += 1
            urrr = 'https://www.nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=1000&sby=010000&asc=000101&urut=1' + `&no1=${no1}&no2=${no2}&kk=${kk}`
        }
        console.log(urrr)
        data = await getRows(urrr)
        allData = [...allData, ...data];
        console.log(allData.length)
    }

    // Mengonversi data array ke format CSV
    const csvContent = allData.map(e => e.join('|')).join('\n');

    // Menyimpan CSV ke file
    const filePath = path.join(__dirname, 'data-output-kodepos.csv');
    fs.writeFileSync(filePath, csvContent);

    console.log(`Data telah ditulis ke ${filePath}`);
})();

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nota = await prisma.nota.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: { no: "asc" },
        },
      },
    });

    if (!nota) {
      return NextResponse.json({ error: "Nota not found" }, { status: 404 });
    }

    let logoDataUrl = "";
    try {
      const logoPath = join(process.cwd(), "public", "logo-noBackground.png");
      const logoBuffer = readFileSync(logoPath);
      logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch {
      logoDataUrl = "";
    }

    let tandaTanganBase64 = "";
    try {
      const tandaTanganPath = join(process.cwd(), "public", "tanda-tangan.png");
      const tandaTanganBuffer = readFileSync(tandaTanganPath);
      tandaTanganBase64 = tandaTanganBuffer.toString("base64");
    } catch {
      tandaTanganBase64 = "";
    }

    const formatRupiah = (amount: any) => {
      return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const bulanRomawi = (date: Date) => {
      const bulan = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ];

      return bulan[new Date(date).getMonth()];
    };

    const nomorNotaLengkap = `${String(nota.nomorNota).padStart(
      4,
      "0"
    )}/Nota-KMG/${bulanRomawi(nota.tanggal)}/${new Date(
      nota.tanggal
    ).getFullYear()}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Nota Pembayaran</title>

  <style>
    @page {
      size: 16.5cm 21.6cm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      color: #1e40af;
    }

    .nota-page {
      width: 16.5cm;
      height: 21.6cm;
      padding: 0.8cm 0.9cm 0;
      position: relative;
      overflow: hidden;
      background: #ffffff;
    }

    .watermark {
      position: absolute;
      inset: 0;
      z-index: 0;
      opacity: 0.035;
      font-size: 42px;
      color: #1e40af;
      line-height: 1.8;
      transform: rotate(-18deg);
      padding: 1cm;
      pointer-events: none;
      white-space: pre-wrap;
    }

    .content {
      position: relative;
      z-index: 1;
    }

    .header {
      display: grid;
      grid-template-columns: 3.7cm 1fr;
      align-items: center;
      column-gap: 0.5cm;
      margin-bottom: 0.35cm;
    }

    .logo-box img {
      width: 3.5cm;
      height: auto;
      object-fit: contain;
    }

    .title {
      text-align: right;
      font-size: 30px;
      line-height: 1.05;
      font-weight: 900;
      letter-spacing: 1px;
      color: #1e40af;
      text-transform: uppercase;
      padding-right: 0.05cm;
    }

    .divider {
      height: 2px;
      background: #1e40af;
      margin: 0.08cm 0 0.45cm;
      position: relative;
    }

    .divider::before,
    .divider::after {
      content: "";
      width: 7px;
      height: 7px;
      background: #1e40af;
      border-radius: 50%;
      position: absolute;
      top: -2.5px;
    }

    .divider::before {
      left: 0;
    }

    .divider::after {
      right: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      column-gap: 0.8cm;
      margin-bottom: 0.45cm;
      font-size: 10px;
      font-weight: 700;
      color: #1e40af;
    }

    .info-row {
      display: grid;
      grid-template-columns: 2.5cm 0.2cm 1fr;
      align-items: center;
      margin-bottom: 0.18cm;
    }

    .info-right .info-row {
      grid-template-columns: 1.5cm 0.2cm 1fr;
    }

    .line {
      border-bottom: 1px dotted #1e40af;
      min-height: 13px;
      color: #111;
      font-weight: 700;
      padding-left: 3px;
      font-size: 8.5px;
      line-height: 1.05;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table {
      margin-top: 0.12cm;
      border: 1.5px solid #1e40af;
    }

    .items-table th {
      background: #1e40af;
      color: white;
      border: 1.5px solid #1e40af;
      padding: 7px 5px;
      font-size: 10px;
      text-align: center;
      font-weight: 800;
    }

    .items-table td {
      border: 1.2px solid #1e40af;
      padding: 4px 5px;
      font-size: 8px;
      color: #111;
      height: 23px;
      vertical-align: top;
    }

    .items-table .no {
      width: 0.8cm;
      text-align: center;
      font-weight: 700;
      color: #1e40af;
    }

    .items-table .desc {
      width: auto;
    }

    .items-table .qty {
      width: 1.3cm;
      text-align: center;
    }

    .items-table .harga,
    .items-table .jumlah {
      width: 2.45cm;
      text-align: right;
      white-space: nowrap;
    }

    .middle-section {
      display: grid;
      grid-template-columns: 1fr 6.55cm;
      column-gap: 0.5cm;
      margin-top: 0.25cm;
      align-items: start;
    }

    .thanks {
      font-size: 20px;
      line-height: 1.18;
      font-weight: 900;
      color: #1e40af;
      text-transform: uppercase;
      padding-top: 0.35cm;
    }

    .summary-table {
      border: 1.5px solid #1e40af;
    }

    .summary-table td {
      border: 1.2px solid #1e40af;
      height: 0.7cm;
      font-size: 9px;
      font-weight: 800;
      padding: 5px 8px;
    }

    .summary-label {
      width: 2.45cm;
      background: #1e40af;
      color: white;
    }

    .summary-value {
      text-align: right;
      color: #111;
      white-space: nowrap;
    }

    .summary-sisa .summary-label {
      background: #dc2626;
    }

    .summary-sisa .summary-value {
      color: #dc2626;
      border-color: #dc2626;
    }

    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 1.2cm;
      margin-top: 0.5cm;
      text-align: center;
      color: #1e40af;
      font-size: 10px;
      font-weight: 600;
    }

    .signature-title {
      margin-bottom: 0.12cm;
    }

    .signature-img {
      height: 0.9cm;
      width: 2.8cm;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }

    .signature-space {
      height: 0.9cm;
    }

    .signature-name {
      display: inline-block;
      min-width: 4.2cm;
      border-bottom: 1.5px dotted #1e40af;
      padding-bottom: 2px;
      color: #1e40af;
      font-weight: 800;
    }

    .signature-position {
      display: block;
      margin-top: 3px;
      font-size: 8px;
      font-weight: 700;
      color: #1e40af;
    }

    .footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1cm;
      background: #1e40af;
      color: white;
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      align-items: center;
      padding: 0 0.9cm;
      font-size: 9px;
      font-weight: 600;
      z-index: 2;
    }

    .footer div:first-child {
      text-align: left;
      padding-left: 0;
    }

    .footer div:last-child {
      text-align: center;
      line-height: 1.2;
    }
  </style>
</head>

<body>
  <div class="nota-page">
    <div class="watermark">
      ✧  ◌  ✦  ◌  ✧  ◌  ✦  ◌  ✧  ◌  ✦
      ◌  ✧  ◌  ✦  ◌  ✧  ◌  ✦  ◌  ✧
      ✦  ◌  ✧  ◌  ✦  ◌  ✧  ◌  ✦
      ◌  ✦  ◌  ✧  ◌  ✦  ◌  ✧  ◌
    </div>

    <div class="content">
      <div class="header">
        <div class="logo-box">
          ${logoDataUrl ? `<img src="${logoDataUrl}" />` : ""}
        </div>

        <div class="title">
          NOTA<br />
          PEMBAYARAN
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-grid">
        <div>
          <div class="info-row">
            <div>No. Pembayaran</div>
            <div>:</div>
            <div class="line">${nomorNotaLengkap}</div>
          </div>
        </div>

        <div class="info-right">
          <div class="info-row">
            <div>Nama</div>
            <div>:</div>
            <div class="line">${nota.kepadaYth}</div>
          </div>

          <div class="info-row">
            <div>Tanggal</div>
            <div>:</div>
            <div class="line">${formatDate(nota.tanggal)}</div>
          </div>

          <div class="info-row">
            <div>No. Telp</div>
            <div>:</div>
            <div class="line">&nbsp;</div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Deskripsi</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          ${nota.items
            .map(
              (item) => `
                <tr>
                  <td class="no">${item.no}</td>
                  <td class="desc">${item.jenisBarang}</td>
                  <td class="qty">${item.qty}</td>
                  <td class="harga">${formatRupiah(item.harga)}</td>
                  <td class="jumlah">${formatRupiah(item.jumlah)}</td>
                </tr>
              `
            )
            .join("")}

          ${Array.from({ length: Math.max(0, 10 - nota.items.length) })
            .map(
              (_, index) => `
                <tr>
                  <td class="no">${nota.items.length + index + 1}</td>
                  <td class="desc"></td>
                  <td class="qty"></td>
                  <td class="harga"></td>
                  <td class="jumlah"></td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>

      <div class="middle-section">
        <div class="thanks">
          TERIMA KASIH<br />
          ATAS KUNJUNGAN<br />
          ANDA.
        </div>

        <table class="summary-table">
          <tr>
            <td class="summary-label">Total</td>
            <td class="summary-value">${formatRupiah(nota.total)}</td>
          </tr>

          <tr>
            <td class="summary-label">DP</td>
            <td class="summary-value">${formatRupiah(nota.dp)}</td>
          </tr>

          <tr class="summary-sisa">
            <td class="summary-label">Sisa</td>
            <td class="summary-value">${formatRupiah(nota.sisa)}</td>
          </tr>
        </table>
      </div>

      <div class="signature-section">
        <div>
          <div class="signature-title">Tanda Terima,</div>
          <div class="signature-space"></div>
          <div class="signature-name">&nbsp;</div>
        </div>

        <div>
          <div class="signature-title">Hormat Kami,</div>
          ${
            tandaTanganBase64
              ? `<img class="signature-img" src="data:image/png;base64,${tandaTanganBase64}" />`
              : `<div class="signature-space"></div>`
          }
          <div class="signature-name">Samsir</div>
          <span class="signature-position">Direktur</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>☎ 0811 779 969</div>
      <div>Ruko Central Legenda Point Blok I Batam Centre - Batam</div>
    </div>
  </div>
</body>
</html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: "load",
    });

    const pdfBuffer = await page.pdf({
      width: "16.5cm",
      height: "21.6cm",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    await browser.close();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Nota-${nomorNotaLengkap}.pdf"`,
      },
    });
  } catch (error: any) {
      console.error("Error generating PDF:", error);
      console.error("PDF ERROR STACK:", error?.stack);

      return NextResponse.json(
        {
          error: "Failed to generate PDF",
          message: error?.message,
          stack: error?.stack,
        },
        { status: 500 }
      );
    }
}
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cm = 28.3464567;

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

    const pageWidth = 16.5 * cm;
    const pageHeight = 21.6 * cm;

    const doc = new PDFDocument({
      size: [pageWidth, pageHeight],
      margin: 0,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBufferPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    const blue = "#1e40af";
    const red = "#dc2626";
    const black = "#111111";

    const marginX = 0.9 * cm;
    let y = 0.8 * cm;

    const logoPath = join(process.cwd(), "public", "logo-noBackground.png");
    const tandaTanganPath = join(process.cwd(), "public", "tanda-tangan.png");

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

    // watermark
    doc.save();
    doc.opacity(0.04);
    doc.rotate(-18, { origin: [pageWidth / 2, pageHeight / 2] });
    doc
      .font("Helvetica-Bold")
      .fontSize(32)
      .fillColor(blue)
      .text("✧  ◌  ✦  ◌  ✧  ◌  ✦  ◌  ✧", -10, 120, {
        width: pageWidth + 100,
        align: "center",
      })
      .text("◌  ✧  ◌  ✦  ◌  ✧  ◌  ✦  ◌", -10, 190, {
        width: pageWidth + 100,
        align: "center",
      })
      .text("✦  ◌  ✧  ◌  ✦  ◌  ✧  ◌  ✦", -10, 260, {
        width: pageWidth + 100,
        align: "center",
      });
    doc.restore();

    // header
    if (existsSync(logoPath)) {
      doc.image(logoPath, marginX, y, {
        width: 3.5 * cm,
      });
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor(blue)
      .text("NOTA\nPEMBAYARAN", marginX, y, {
        width: pageWidth - marginX * 2,
        align: "right",
        lineGap: -2,
      });

    y += 2.15 * cm;

    // divider
    doc
      .strokeColor(blue)
      .lineWidth(2)
      .moveTo(marginX, y)
      .lineTo(pageWidth - marginX, y)
      .stroke();

    doc.circle(marginX, y, 3.5).fillColor(blue).fill();
    doc.circle(pageWidth - marginX, y, 3.5).fillColor(blue).fill();

    y += 0.45 * cm;

    // info
    doc.font("Helvetica-Bold").fontSize(10).fillColor(blue);

    const leftX = marginX;
    const rightX = pageWidth / 2 + 0.35 * cm;

    doc.text("No. Pembayaran", leftX, y);
    doc.text(":", leftX + 2.5 * cm, y);
    doc.fillColor(black).fontSize(8.5).text(nomorNotaLengkap, leftX + 2.8 * cm, y);
    doc
      .strokeColor(blue)
      .lineWidth(0.6)
      .moveTo(leftX + 2.8 * cm, y + 12)
      .lineTo(pageWidth / 2 - 0.25 * cm, y + 12)
      .stroke();

    doc.font("Helvetica-Bold").fontSize(10).fillColor(blue);
    doc.text("Nama", rightX, y);
    doc.text(":", rightX + 1.5 * cm, y);
    doc.fillColor(black).fontSize(8.5).text(nota.kepadaYth, rightX + 1.8 * cm, y);
    doc
      .strokeColor(blue)
      .moveTo(rightX + 1.8 * cm, y + 12)
      .lineTo(pageWidth - marginX, y + 12)
      .stroke();

    y += 0.38 * cm;

    doc.font("Helvetica-Bold").fontSize(10).fillColor(blue);
    doc.text("Tanggal", rightX, y);
    doc.text(":", rightX + 1.5 * cm, y);
    doc.fillColor(black).fontSize(8.5).text(formatDate(nota.tanggal), rightX + 1.8 * cm, y);
    doc
      .strokeColor(blue)
      .moveTo(rightX + 1.8 * cm, y + 12)
      .lineTo(pageWidth - marginX, y + 12)
      .stroke();

    y += 0.38 * cm;

    doc.font("Helvetica-Bold").fontSize(10).fillColor(blue);
    doc.text("No. Telp", rightX, y);
    doc.text(":", rightX + 1.5 * cm, y);
    doc
      .strokeColor(blue)
      .moveTo(rightX + 1.8 * cm, y + 12)
      .lineTo(pageWidth - marginX, y + 12)
      .stroke();

    y += 0.55 * cm;

    // table
    const tableX = marginX;
    const tableW = pageWidth - marginX * 2;
    const col = {
      no: 0.8 * cm,
      qty: 1.3 * cm,
      harga: 2.45 * cm,
      total: 2.45 * cm,
    };
    const descW = tableW - col.no - col.qty - col.harga - col.total;
    const rowH = 0.62 * cm;

    const drawCell = (
      x: number,
      yPos: number,
      w: number,
      h: number,
      text: string,
      options?: { align?: "left" | "center" | "right"; fill?: string; color?: string; bold?: boolean }
    ) => {
      if (options?.fill) {
        doc.rect(x, yPos, w, h).fill(options.fill);
      }

      doc.rect(x, yPos, w, h).strokeColor(blue).lineWidth(1).stroke();

      doc
        .font(options?.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(options?.bold ? 10 : 8)
        .fillColor(options?.color || black)
        .text(text, x + 4, yPos + 7, {
          width: w - 8,
          align: options?.align || "left",
        });
    };

    let x = tableX;

    drawCell(x, y, col.no, rowH, "No", {
      align: "center",
      fill: blue,
      color: "#ffffff",
      bold: true,
    });
    x += col.no;

    drawCell(x, y, descW, rowH, "Deskripsi", {
      align: "center",
      fill: blue,
      color: "#ffffff",
      bold: true,
    });
    x += descW;

    drawCell(x, y, col.qty, rowH, "Jumlah", {
      align: "center",
      fill: blue,
      color: "#ffffff",
      bold: true,
    });
    x += col.qty;

    drawCell(x, y, col.harga, rowH, "Harga", {
      align: "center",
      fill: blue,
      color: "#ffffff",
      bold: true,
    });
    x += col.harga;

    drawCell(x, y, col.total, rowH, "Total", {
      align: "center",
      fill: blue,
      color: "#ffffff",
      bold: true,
    });

    y += rowH;

    const rows = [
      ...nota.items,
      ...Array.from({ length: Math.max(0, 10 - nota.items.length) }).map(
        (_, index) => ({
          no: nota.items.length + index + 1,
          jenisBarang: "",
          qty: "",
          harga: "",
          jumlah: "",
        })
      ),
    ];

    rows.forEach((item: any) => {
      x = tableX;

      drawCell(x, y, col.no, rowH, String(item.no || ""), {
        align: "center",
        color: blue,
        bold: true,
      });
      x += col.no;

      drawCell(x, y, descW, rowH, item.jenisBarang || "");
      x += descW;

      drawCell(x, y, col.qty, rowH, item.qty ? String(item.qty) : "", {
        align: "center",
      });
      x += col.qty;

      drawCell(x, y, col.harga, rowH, item.harga ? formatRupiah(item.harga) : "", {
        align: "right",
      });
      x += col.harga;

      drawCell(x, y, col.total, rowH, item.jumlah ? formatRupiah(item.jumlah) : "", {
        align: "right",
      });

      y += rowH;
    });

    y += 0.35 * cm;

    // thanks + summary
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(blue)
      .text("TERIMA KASIH\nATAS KUNJUNGAN\nANDA.", marginX, y + 0.3 * cm, {
        width: 6.2 * cm,
        lineGap: 0,
      });

    const summaryX = pageWidth - marginX - 6.55 * cm;
    const summaryLabelW = 2.45 * cm;
    const summaryValueW = 4.1 * cm;
    const summaryH = 0.7 * cm;

    const drawSummary = (label: string, value: string, yPos: number, danger = false) => {
      drawCell(summaryX, yPos, summaryLabelW, summaryH, label, {
        fill: danger ? red : blue,
        color: "#ffffff",
        bold: true,
      });

      drawCell(summaryX + summaryLabelW, yPos, summaryValueW, summaryH, value, {
        align: "right",
        color: danger ? red : black,
        bold: true,
      });
    };

    drawSummary("Total", formatRupiah(nota.total), y);
    drawSummary("DP", formatRupiah(nota.dp), y + summaryH);
    drawSummary("Sisa", formatRupiah(nota.sisa), y + summaryH * 2, true);

    y += 2.45 * cm;

    // signature
    const sigY = y;
    const sigLeftX = marginX + 1 * cm;
    const sigRightX = pageWidth / 2 + 1.1 * cm;

    doc.font("Helvetica-Bold").fontSize(10).fillColor(blue);

    doc.text("Tanda Terima,", sigLeftX, sigY, {
      width: 4.2 * cm,
      align: "center",
    });

    doc.text("Hormat Kami,", sigRightX, sigY, {
      width: 4.2 * cm,
      align: "center",
    });

    if (existsSync(tandaTanganPath)) {
      doc.image(tandaTanganPath, sigRightX + 0.75 * cm, sigY + 0.35 * cm, {
        width: 2.8 * cm,
      });
    }

    doc
      .strokeColor(blue)
      .lineWidth(1)
      .moveTo(sigLeftX, sigY + 1.55 * cm)
      .lineTo(sigLeftX + 4.2 * cm, sigY + 1.55 * cm)
      .stroke();

    doc
      .moveTo(sigRightX, sigY + 1.55 * cm)
      .lineTo(sigRightX + 4.2 * cm, sigY + 1.55 * cm)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(blue)
      .text("Samsir", sigRightX, sigY + 1.6 * cm, {
        width: 4.2 * cm,
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("Direktur", sigRightX, sigY + 1.95 * cm, {
        width: 4.2 * cm,
        align: "center",
      });

    // footer
    const footerH = 1 * cm;
    doc.rect(0, pageHeight - footerH, pageWidth, footerH).fill(blue);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#ffffff")
      .text("☎ 0811 779 969", marginX, pageHeight - footerH + 10, {
        width: 6.2 * cm,
        align: "left",
      });

    doc.text(
      "Ruko Central Legenda Point Blok I Batam Centre - Batam",
      pageWidth / 2 - 0.3 * cm,
      pageHeight - footerH + 10,
      {
        width: pageWidth / 2,
        align: "center",
      }
    );

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Nota-${String(
          nota.nomorNota
        ).padStart(4, "0")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);

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
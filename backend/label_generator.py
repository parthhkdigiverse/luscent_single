import io
import base64
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import inch
from reportlab.lib.colors import black, red, gray
from reportlab.lib.utils import ImageReader
import barcode
from barcode.writer import ImageWriter

def draw_barcode(c, value, x, y, width, height, draw_text=True):
    try:
        # Create barcode image in memory
        rv = io.BytesIO()
        code128 = barcode.get('code128', value, writer=ImageWriter())
        options = {
            'module_width': 0.35, 
            'module_height': 8.0, 
            'font_size': 7, 
            'text_distance': 4.0, 
            'quiet_zone': 1.0,
            'write_text': draw_text
        }
        code128.write(rv, options=options)
        rv.seek(0)
        c.drawImage(ImageReader(rv), x, y, width=width, height=height, preserveAspectRatio=True)
    except Exception as e:
        print(f"Error drawing barcode: {e}")
        c.setFont("Helvetica", 10)
        c.drawString(x, y + height/2, f"*{value}*")

def generate_custom_label_pdf(order: dict, delhivery_data: dict) -> str:
    """Generates a PDF shipping label matching the requested Delhivery layout and returns base64."""
    
    # Extract data from Delhivery JSON (or fallback to order dict)
    pkg = {}
    if delhivery_data and "packages" in delhivery_data and len(delhivery_data["packages"]) > 0:
        pkg = delhivery_data["packages"][0]
        
    tracking_number = pkg.get("wbn") or order.get("tracking_number", "")
    order_id = pkg.get("oid") or str(order.get("_id", ""))
    
    seller_name = pkg.get("seller_name") or "Luscent Glow"
    seller_address = pkg.get("seller_address") or "478, AR Mall, Mota Varachha, Surat, Gujarat"
    seller_gst = pkg.get("seller_gst") or "24-UR"
    
    cust_name = pkg.get("name") or order.get("name", "")
    cust_address = pkg.get("address") or f"{order.get('address', '')}"
    cust_city = pkg.get("destination") or order.get("city", "")
    cust_pin = pkg.get("pin") or order.get("zipCode", "")
    
    payment_type = pkg.get("pt") or ("COD" if order.get("paymentMethod") == "cod" else "PREPAID")
    total_amount = pkg.get("rs") or float(order.get("totalPrice") or 0)
    
    date_str = pkg.get("cd") or datetime.now().isoformat()
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        date_display = dt.strftime("%Y-%m-%d\n%H:%M:%S")
    except:
        date_display = str(date_str)

    # Calculate Qty and Title
    product_title = pkg.get("prddesc") or "LUSCENT GLOW B2C package"
    qty = 1
    if "items" in order and len(order["items"]) > 0:
        qty = sum(item.get("quantity", 1) for item in order["items"])
        if not pkg.get("prddesc"):
            product_title = order["items"][0].get("name", "Product")
            if len(order["items"]) > 1:
                product_title += f" (+{len(order['items'])-1} more)"

    # Label Size: 4x6 inches
    width, height = 4 * inch, 6 * inch
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Outer Border
    margin = 0.2 * inch
    c.setLineWidth(1.5)
    c.rect(margin, margin, width - 2*margin, height - 2*margin)
    
    # Header Line
    c.line(margin, height - 0.7*inch, width - margin, height - 0.7*inch)
    
    # Vertical Line for Header Split
    c.line(width/2 - 0.5*inch, height - 0.7*inch, width/2 - 0.5*inch, height - margin)
    
    # Seller Name
    c.setFont("Times-Bold", 12)
    c.drawString(margin + 10, height - 0.45*inch, seller_name)
    
    right_center = ( (width/2 - 0.5*inch) + (width - margin) ) / 2.0
    
    import os
    logo_path = os.path.join(os.path.dirname(__file__), "delhivery-logo.png")
    if os.path.exists(logo_path):
        # The user's image is 320x320 (square) with transparent padding.
        # Use a large square bounding box to make the visible center part big enough.
        logo_size = 2.0 * inch
        start_x = right_center - (logo_size / 2.0)
        # Shift down by 0.08 inches to add space at the top
        start_y = height - 0.35*inch - (logo_size / 2.0) - 0.08*inch
        c.drawImage(logo_path, start_x, start_y, width=logo_size, height=logo_size, preserveAspectRatio=True, mask='auto')
    else:
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(black)
        c.drawCentredString(right_center, height - 0.45*inch, "DELHIVERY")
    
    # Top Barcode (AWB)
    draw_barcode(c, tracking_number, margin + 0.2*inch, height - 1.6*inch, 3.2*inch, 0.8*inch, draw_text=True)
    
    # Horizontal Line below barcode
    c.line(margin, height - 1.7*inch, width - margin, height - 1.7*inch)
    
    # Pin Code and Routing
    c.setFont("Helvetica", 12)
    c.drawString(margin + 5, height - 1.6*inch, str(cust_pin))
    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - margin - 5, height - 1.6*inch, "SRT/GCI") # Hardcoded for display matching
    
    # Vertical Line for Ship To / COD split
    c.line(width - 1.2*inch, height - 3.2*inch, width - 1.2*inch, height - 1.7*inch)
    
    # Ship To Box
    y_ship = height - 1.85*inch
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin + 5, y_ship, "Ship To:")
    y_ship -= 14
    c.setFont("Times-Bold", 12)
    c.drawString(margin + 5, y_ship, cust_name.upper())
    y_ship -= 12
    c.setFont("Times-Roman", 10)
    c.drawString(margin + 5, y_ship, cust_name)
    
    # Address wrapping (simple)
    import textwrap
    addr_lines = textwrap.wrap(cust_address, width=40)
    for line in addr_lines:
        y_ship -= 12
        c.drawString(margin + 5, y_ship, line)
    
    y_ship -= 12
    c.drawString(margin + 5, y_ship, cust_city)
    y_ship -= 14
    c.setFont("Times-Bold", 10)
    c.drawString(margin + 5, y_ship, f"PIN:{cust_pin}")
    
    # Payment Box
    y_pay = height - 2.0*inch
    payment_center = ( (width - 1.2*inch) + (width - margin) ) / 2.0
    c.setFont("Times-Bold", 11)
    c.drawCentredString(payment_center, y_pay, str(payment_type))
    y_pay -= 14
    c.setFont("Times-Roman", 10)
    c.drawCentredString(payment_center, y_pay, "Surface")
    
    y_pay -= 24
    c.setFont("Times-Bold", 11)
    c.drawCentredString(payment_center, y_pay, "INR")
    y_pay -= 14
    c.drawCentredString(payment_center, y_pay, str(int(total_amount)))
    
    # Line below Ship To
    c.line(margin, height - 3.2*inch, width - margin, height - 3.2*inch)
    
    y_seller = height - 3.35*inch
    c.setFont("Times-Bold", 9)
    c.drawString(margin + 5, y_seller, "Seller: ")
    c.setFont("Times-Roman", 9)
    c.drawString(margin + 35, y_seller, seller_name)
    
    y_seller -= 11
    c.setFont("Times-Bold", 9)
    c.drawString(margin + 5, y_seller, "Address: ")
    c.setFont("Times-Roman", 8)
    import textwrap
    addr_lines = textwrap.wrap(seller_address, width=32)[:2]
    c.drawString(margin + 45, y_seller, addr_lines[0])
    if len(addr_lines) > 1:
        y_seller -= 10
        c.drawString(margin + 45, y_seller, addr_lines[1] + ("..." if len(seller_address) > 60 else ""))
    
    y_seller -= 11
    c.setFont("Times-Bold", 9)
    c.drawString(margin + 5, y_seller, "GST: ")
    c.setFont("Times-Roman", 9)
    c.drawString(margin + 30, y_seller, seller_gst)
    
    # Vertical Line for Seller / Date split
    c.line(width - 1.4*inch, height - 3.95*inch, width - 1.4*inch, height - 3.2*inch)
    
    # Date Box
    y_date = height - 3.35*inch
    c.setFont("Times-Bold", 9)
    c.drawString(width - 1.3*inch, y_date, "Date: ")
    c.setFont("Times-Roman", 9)
    parts = date_display.split("\n")
    if len(parts) > 1:
        c.drawString(width - 1.3*inch, y_date - 11, parts[0])
        c.drawString(width - 1.3*inch, y_date - 22, parts[1])
    else:
        c.drawString(width - 1.3*inch, y_date - 11, date_display)
        
    # Line below Seller
    c.line(margin, height - 3.95*inch, width - margin, height - 3.95*inch)
    
    # Product Table Header
    y_th = height - 4.1*inch
    c.setFont("Times-Roman", 10)
    c.drawString(margin + 5, y_th, "Product(Qty)")
    
    # Vertical lines for Product Table
    c.line(width - 1.4*inch, height - 4.85*inch, width - 1.4*inch, height - 3.95*inch) # Before Price
    c.line(width - 0.7*inch, height - 4.85*inch, width - 0.7*inch, height - 3.95*inch) # Before Total
    
    c.drawCentredString(width - 1.05*inch, y_th, "Price")
    c.drawCentredString(width - 0.45*inch, y_th, "Total")
    
    # Line below Table Header
    c.line(margin, height - 4.2*inch, width - margin, height - 4.2*inch)
    
    # Table Content
    y_td = height - 4.55*inch
    
    import textwrap
    prod_lines = textwrap.wrap(product_title, width=32)[:2]
    c.drawString(margin + 5, y_td, prod_lines[0])
    if len(prod_lines) > 1:
        c.drawString(margin + 5, y_td - 10, prod_lines[1] + ("..." if len(product_title) > 60 else ""))
        
    c.drawCentredString(width - 1.05*inch, y_td, f"INR {int(total_amount)}")
    c.drawCentredString(width - 0.45*inch, y_td, f"INR {int(total_amount)}")
    
    # Line below Table Content
    c.line(margin, height - 4.65*inch, width - margin, height - 4.65*inch)
    
    # Total Row
    y_total = height - 4.8*inch
    c.drawString(margin + 5, y_total, "Total")
    c.drawCentredString(width - 1.05*inch, y_total, f"INR {int(total_amount)}")
    c.drawCentredString(width - 0.45*inch, y_total, f"INR {int(total_amount)}")
    
    # Line below Total
    c.line(margin, height - 4.85*inch, width - margin, height - 4.85*inch)
    
    # Bottom Barcode (Order ID)
    draw_barcode(c, order_id, margin + 0.5*inch, height - 5.45*inch, 2.6*inch, 0.55*inch, draw_text=True)
    
    # Line below bottom barcode
    c.line(margin, height - 5.5*inch, width - margin, height - 5.5*inch)
    
    # Footer Return Address
    y_footer = height - 5.65*inch
    c.setFont("Times-Roman", 10)
    c.drawString(margin + 5, y_footer, f"Return Address: {seller_address[:60]}")
    c.drawString(margin + 5, y_footer - 12, seller_address[60:])
    
    c.showPage()
    c.save()
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return base64.b64encode(pdf_bytes).decode("utf-8")

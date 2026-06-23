import os
import sqlite3
import uuid
from datetime import datetime, timedelta

from flask import Flask, jsonify, redirect, render_template, request, send_from_directory

app = Flask(__name__)

BASE_INSTANCE = "./instance"
UPLOAD_FOLDER = "./instance/static/uploads"

os.makedirs(BASE_INSTANCE, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DB = os.path.join(BASE_INSTANCE, "paper-guides-ads.db")


def db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init():
    conn = db()
    cur = conn.cursor()

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS sponsors (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        tier TEXT DEFAULT 'bronze',
        brand_logo TEXT,
        promised_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'active',
        archived INTEGER DEFAULT 0,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY,
        sponsor_id INTEGER NULL,
        advertiser_name TEXT NOT NULL,
        advertiser_email TEXT,
        campaign_name TEXT,
        square_image TEXT NOT NULL,
        horizontal_image TEXT,
        vertical_image TEXT,
        click_url TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        billing_amount REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'unpaid',
        weight INTEGER DEFAULT 1,
        active INTEGER DEFAULT 1,
        archived INTEGER DEFAULT 0,
        created_at TEXT
    );
    """)

    conn.commit()
    conn.close()


init()


def save_file(file, existing=None):
    if not file or file.filename == "":
        return existing

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
        ext = ".webp"

    filename = str(uuid.uuid4()) + ext
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    return "/instance/static/uploads/" + filename


def update_sponsor_status(cur, sponsor_id):
    cur.execute("SELECT status FROM sponsors WHERE id = ?", (sponsor_id,))
    row = cur.fetchone()
    if row and row["status"] == "suspended":
        return

    cur.execute(
        """
        UPDATE sponsors
        SET status =
            CASE
                WHEN paid_amount >= promised_amount AND promised_amount > 0 THEN 'completed'
                WHEN paid_amount > 0 AND paid_amount < promised_amount THEN 'active'
                WHEN paid_amount = 0 AND promised_amount > 0 THEN 'overdue'
                ELSE 'active'
            END
        WHERE id = ?
    """,
        (sponsor_id,),
    )


@app.route("/instance/static/uploads/<filename>")
def serve_uploads(filename):
    return send_from_directory("./instance/static/uploads", filename)


@app.route("/", methods=["GET"])
def index():
    conn = db()
    cur = conn.cursor()

    today = datetime.utcnow().strftime("%Y-%m-%d")
    soon = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")

    cur.execute("SELECT * FROM sponsors WHERE archived = 0 ORDER BY id DESC")
    sponsors = cur.fetchall()

    cur.execute("""
        SELECT ads.*, sponsors.name AS sponsor_name, sponsors.brand_logo AS sponsor_logo
        FROM ads
        LEFT JOIN sponsors ON ads.sponsor_id = sponsors.id
        WHERE ads.archived = 0
        ORDER BY ads.id DESC
    """)
    ads = cur.fetchall()

    cur.execute("SELECT * FROM sponsors WHERE archived = 1 ORDER BY id DESC")
    archived_sponsors = cur.fetchall()

    cur.execute("""
        SELECT ads.*, sponsors.name AS sponsor_name
        FROM ads
        LEFT JOIN sponsors ON ads.sponsor_id = sponsors.id
        WHERE ads.archived = 1
        ORDER BY ads.id DESC
    """)
    archived_ads = cur.fetchall()

    cur.execute("SELECT COUNT(*) AS c FROM sponsors WHERE status != 'suspended' AND archived = 0")
    active_sponsors = cur.fetchone()["c"]

    cur.execute("SELECT COUNT(*) AS c FROM ads WHERE active = 1 AND archived = 0")
    active_ads = cur.fetchone()["c"]

    cur.execute("SELECT COALESCE(SUM(paid_amount), 0) FROM sponsors WHERE archived = 0")
    sponsor_total = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(SUM(billing_amount), 0) FROM ads WHERE payment_status = 'paid' AND archived = 0")
    ad_total = cur.fetchone()[0]
    total_revenue = sponsor_total + ad_total

    cur.execute("SELECT COALESCE(SUM(billing_amount), 0) AS t FROM ads WHERE payment_status = 'unpaid' AND archived = 0")
    pending_payments = cur.fetchone()["t"]

    conn.close()

    def fmt(n):
        return f"Rs {int(n):,}"

    stats = {
        "active_sponsors": active_sponsors,
        "active_ads": active_ads,
        "total_revenue": fmt(total_revenue),
        "pending_payments": fmt(pending_payments),
    }

    return render_template(
        "index.html",
        sponsors=sponsors,
        ads=ads,
        archived_sponsors=archived_sponsors,
        archived_ads=archived_ads,
        stats=stats,
        today=today,
        soon=soon,
    )


@app.route("/api/ads")
def api_ads():
    conn = db()
    cur = conn.cursor()

    today = datetime.utcnow().strftime("%Y-%m-%d")

    cur.execute(
        """
        SELECT
            ads.id, ads.campaign_name, ads.click_url,
            ads.square_image, ads.horizontal_image, ads.vertical_image,
            ads.weight,
            sponsors.name AS sponsor_name,
            sponsors.brand_logo AS sponsor_logo
        FROM ads
        LEFT JOIN sponsors ON ads.sponsor_id = sponsors.id
        WHERE ads.active = 1
          AND (ads.start_date IS NULL OR ads.start_date <= ?)
          AND (ads.end_date   IS NULL OR ads.end_date   >= ?)
        ORDER BY ads.weight DESC
    """,
        (today, today),
    )

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    return jsonify(rows)


@app.route("/add_sponsor", methods=["POST"])
def add_sponsor():
    name = request.form["name"]
    email = request.form.get("email")
    tier = request.form.get("tier", "bronze")
    promised_amount = float(request.form.get("promised_amount", 0) or 0)
    paid_amount = float(request.form.get("paid_amount", 0) or 0)
    start_date = request.form.get("start_date") or None
    end_date = request.form.get("end_date") or None
    brand_logo = save_file(request.files.get("brand_logo"))

    conn = db()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO sponsors
            (name, email, tier, brand_logo, promised_amount, paid_amount,
             start_date, end_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (name, email, tier, brand_logo, promised_amount, paid_amount, start_date, end_date, datetime.utcnow().isoformat()),
    )

    update_sponsor_status(cur, cur.lastrowid)
    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/sponsor/edit/<int:sponsor_id>", methods=["POST"])
def edit_sponsor(sponsor_id):
    name = request.form["name"]
    email = request.form.get("email")
    tier = request.form.get("tier", "bronze")
    promised_amount = float(request.form.get("promised_amount", 0) or 0)
    start_date = request.form.get("start_date") or None
    end_date = request.form.get("end_date") or None

    conn = db()
    cur = conn.cursor()

    cur.execute("SELECT brand_logo FROM sponsors WHERE id = ?", (sponsor_id,))
    row = cur.fetchone()
    brand_logo = save_file(request.files.get("brand_logo"), existing=row["brand_logo"] if row else None)

    cur.execute(
        """
        UPDATE sponsors
        SET name=?, email=?, tier=?, brand_logo=?,
            promised_amount=?, start_date=?, end_date=?
        WHERE id = ?
    """,
        (name, email, tier, brand_logo, promised_amount, start_date, end_date, sponsor_id),
    )

    update_sponsor_status(cur, sponsor_id)
    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/sponsor/renew/<int:sponsor_id>", methods=["POST"])
def renew_sponsor(sponsor_id):
    new_end_date = request.form.get("end_date") or None
    new_promised = request.form.get("promised_amount")

    conn = db()
    cur = conn.cursor()

    sets = ["end_date = ?", "archived = 0"]
    params = [new_end_date]

    if new_promised:
        sets.append("promised_amount = ?")
        params.append(float(new_promised))

    params.append(sponsor_id)
    cur.execute(f"UPDATE sponsors SET {', '.join(sets)} WHERE id = ?", params)
    update_sponsor_status(cur, sponsor_id)
    conn.commit()
    conn.close()
    return redirect("/")


@app.route("/sponsor/delete/<int:sponsor_id>", methods=["POST"])
def delete_sponsor(sponsor_id):
    conn = db()
    cur = conn.cursor()
    cur.execute("UPDATE sponsors SET archived = 1 WHERE id = ?", (sponsor_id,))
    conn.commit()
    conn.close()
    return redirect("/")


@app.route("/sponsor/suspend/<int:sponsor_id>")
def suspend_sponsor(sponsor_id):
    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT status FROM sponsors WHERE id = ?", (sponsor_id,))
    row = cur.fetchone()
    new_status = "active" if (row and row["status"] == "suspended") else "suspended"
    cur.execute("UPDATE sponsors SET status = ? WHERE id = ?", (new_status, sponsor_id))
    conn.commit()
    conn.close()
    return redirect("/")


@app.route("/sponsor/pay/<int:sponsor_id>", methods=["POST"])
def sponsor_pay(sponsor_id):
    amount = float(request.form.get("amount", 0) or 0)

    conn = db()
    cur = conn.cursor()
    cur.execute("UPDATE sponsors SET paid_amount = paid_amount + ? WHERE id = ?", (amount, sponsor_id))
    update_sponsor_status(cur, sponsor_id)
    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/add_ad", methods=["POST"])
def add_ad():
    advertiser_name = request.form["advertiser_name"]
    advertiser_email = request.form.get("advertiser_email")
    campaign_name = request.form.get("campaign_name")
    click_url = request.form["click_url"]
    sponsor_id = request.form.get("sponsor_id") or None
    start_date = request.form.get("start_date") or None
    end_date = request.form.get("end_date") or None
    billing_amount = float(request.form.get("billing_amount", 0) or 0)
    weight = int(request.form.get("weight", 1) or 1)

    square_image = save_file(request.files.get("square_image"))
    horizontal_image = save_file(request.files.get("horizontal_image"))
    vertical_image = save_file(request.files.get("vertical_image"))

    conn = db()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO ads
            (sponsor_id, advertiser_name, advertiser_email, campaign_name,
             square_image, horizontal_image, vertical_image,
             click_url, start_date, end_date,
             billing_amount, payment_status, weight, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, 0, ?)
    """,
        (
            sponsor_id, advertiser_name, advertiser_email, campaign_name,
            square_image, horizontal_image, vertical_image,
            click_url, start_date, end_date,
            billing_amount, weight, datetime.utcnow().isoformat(),
        ),
    )

    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/ad/edit/<int:ad_id>", methods=["POST"])
def edit_ad(ad_id):
    advertiser_name = request.form["advertiser_name"]
    advertiser_email = request.form.get("advertiser_email")
    campaign_name = request.form.get("campaign_name")
    click_url = request.form["click_url"]
    sponsor_id = request.form.get("sponsor_id") or None
    start_date = request.form.get("start_date") or None
    end_date = request.form.get("end_date") or None
    billing_amount = float(request.form.get("billing_amount", 0) or 0)
    weight = int(request.form.get("weight", 1) or 1)

    conn = db()
    cur = conn.cursor()

    cur.execute("SELECT square_image, horizontal_image, vertical_image FROM ads WHERE id = ?", (ad_id,))
    row = cur.fetchone()

    square_image = save_file(request.files.get("square_image"), existing=row["square_image"] if row else None)
    horizontal_image = save_file(request.files.get("horizontal_image"), existing=row["horizontal_image"] if row else None)
    vertical_image = save_file(request.files.get("vertical_image"), existing=row["vertical_image"] if row else None)

    reset_payment = request.form.get("reset_payment") == "1"

    if reset_payment:
        cur.execute(
            """
            UPDATE ads
            SET advertiser_name=?, advertiser_email=?, campaign_name=?,
                square_image=?, horizontal_image=?, vertical_image=?,
                click_url=?, start_date=?, end_date=?,
                billing_amount=?, sponsor_id=?, weight=?,
                payment_status='unpaid', active=0
            WHERE id = ?
        """,
            (advertiser_name, advertiser_email, campaign_name, square_image, horizontal_image, vertical_image,
             click_url, start_date, end_date, billing_amount, sponsor_id, weight, ad_id),
        )
    else:
        cur.execute(
            """
            UPDATE ads
            SET advertiser_name=?, advertiser_email=?, campaign_name=?,
                square_image=?, horizontal_image=?, vertical_image=?,
                click_url=?, start_date=?, end_date=?,
                billing_amount=?, sponsor_id=?, weight=?
            WHERE id = ?
        """,
            (advertiser_name, advertiser_email, campaign_name, square_image, horizontal_image, vertical_image,
             click_url, start_date, end_date, billing_amount, sponsor_id, weight, ad_id),
        )

    conn.commit()
    conn.close()

    return redirect("/")


@app.route("/ad/renew/<int:ad_id>", methods=["POST"])
def renew_ad(ad_id):
    new_end_date = request.form.get("end_date") or None
    new_start_date = request.form.get("start_date") or None
    new_billing = request.form.get("billing_amount")

    conn = db()
    cur = conn.cursor()

    sets = ["end_date = ?", "active = 1", "archived = 0", "payment_status = 'unpaid'"]
    params = [new_end_date]

    if new_start_date:
        sets.append("start_date = ?")
        params.append(new_start_date)

    if new_billing:
        sets.append("billing_amount = ?")
        params.append(float(new_billing))

    params.append(ad_id)
    cur.execute(f"UPDATE ads SET {', '.join(sets)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return redirect("/")


@app.route("/ad/delete/<int:ad_id>", methods=["POST"])
def delete_ad(ad_id):
    conn = db()
    cur = conn.cursor()
    cur.execute("UPDATE ads SET archived = 1, active = 0 WHERE id = ?", (ad_id,))
    conn.commit()
    conn.close()
    return redirect("/")


@app.route("/ad/pay/<int:ad_id>")
def mark_ad_paid(ad_id):
    conn = db()
    cur = conn.cursor()
    cur.execute("UPDATE ads SET payment_status = 'paid', active = 1 WHERE id = ?", (ad_id,))
    conn.commit()
    conn.close()
    return redirect("/")


@app.route("/toggle_ad/<int:ad_id>")
def toggle_ad(ad_id):
    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT active, payment_status FROM ads WHERE id = ?", (ad_id,))
    ad = cur.fetchone()

    if not ad["active"] and ad["payment_status"] != "paid":
        conn.close()
        return redirect("/?err=unpaid")

    cur.execute("UPDATE ads SET active = ? WHERE id = ?", (0 if ad["active"] else 1, ad_id))
    conn.commit()
    conn.close()
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
import { connectDB } from "@/lib/mongoose";
import Medicine from "@/models/Medicine";

// GET medicines with optional search & category filter
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "All").trim();

    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    if (category !== "All") {
      query.category = category;
    }

    const items = await Medicine.find(query).sort({ createdAt: -1 }).lean();

    return new Response(JSON.stringify({ items }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// POST new medicine
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const newMedicine = await Medicine.create(body);

    return new Response(JSON.stringify(newMedicine), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

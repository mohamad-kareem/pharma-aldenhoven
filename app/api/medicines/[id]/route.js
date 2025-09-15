import { connectDB } from "@/lib/mongoose";
import Medicine from "@/models/Medicine";

// GET medicine by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const medicine = await Medicine.findById(params.id).lean();
    if (!medicine) {
      return new Response(JSON.stringify({ error: "Medicine not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(medicine), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// UPDATE medicine by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const body = await req.json();
    const updated = await Medicine.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    if (!updated) {
      return new Response(JSON.stringify({ error: "Medicine not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// DELETE medicine by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const deleted = await Medicine.findByIdAndDelete(params.id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Medicine not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

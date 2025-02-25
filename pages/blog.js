import { supabase } from "../lib/supabase";

export default function Blog({ blogs }) {
    console.log("📌 Blogs received in component:", blogs); // ✅ Debugging log
  
    return (
      <div>
        <h1>📚 Blog List</h1>
        <ul>
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <li key={blog.id}>
                <h2>📝 {blog.name}</h2>  {/* ✅ Displays blog name */}
                <p>{blog.summary}</p>  {/* ✅ Displays blog summary */}
                <small>🕒 Published: {new Date(blog.created_at).toLocaleDateString()}</small>
              </li>
            ))
          ) : (
            <p>⚠️ No blogs found.</p>
          )}
        </ul>
      </div>
    );
  }
  

export async function getServerSideProps() {
  const { data, error } = await supabase.from("blogs").select("*");

  console.log("🔍 Supabase Response:", data);
  console.log("❌ Supabase Error:", error);

  if (error) {
    return { props: { blogs: [] } };
  }

  return { props: { blogs: data || [] } };
}

  

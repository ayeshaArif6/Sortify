import { useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import "../Gallery.css";



const GalleryPage = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState({});
  const menuRef = useRef(null);


  useEffect(() => {
    const fetchImages = async () => {
      if (!user) return;
  
      try {
        console.log("👤 Current user:", user.uid);
        const q = query(
          collection(db, "images"),
          where("userId", "==", user.uid)
        );
  
        const snapshot = await getDocs(q);
        console.log("Firestore results:", snapshot.docs);
  
        const imageList = snapshot.docs.map(doc => ({
          id: doc.id,          
          ...doc.data()
        }));
        
        setImages(imageList);
      } catch (error) {
        console.error(" Error loading images:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchImages();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  
  const handleRename = async (id) => {
    try {
      await updateDoc(doc(db, "images", id), { name: newName[id] || "" });
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, name: newName[id] || "" } : img
        )
      );
      setEditingId(null);
      setNewName((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error("Error renaming image:", error);
    }
  };
  
  
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "images", id));
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Your Uploaded Images</h2>
      {loading ? (
        <p>Loading...</p>
      ) : images.length === 0 ? (
        <p>No images uploaded yet.</p>
      ) : (
        <div className="gallery-grid">
          {images.map((img, index) => (
  <div key={index} className="gallery-item">
    <img src={img.url} alt={img.name} />
    <div className="image-name-bar">
      <span>{img.name}</span>
      <button
        className="menu-btn"
        onClick={() =>
          setMenuOpenId(menuOpenId === img.id ? null : img.id)
        }
      >
        ⋮
      </button>

      {menuOpenId === img.id && (
  <div className="menu-dropdown" ref={menuRef}>
    <button
      onClick={() => {
        setNewName((prev) => ({ ...prev, [img.id]: img.name }));
        setEditingId(img.id);
        setMenuOpenId(null);
      }}
    >
      ✏️ Rename
    </button>
    <button onClick={() => handleDelete(img.id)}>🗑️ Delete</button>
  </div>
)}


    </div>

    {editingId === img.id && (
      <div className="edit-controls">
        <input
  value={newName[img.id] || ""}
  onChange={(e) =>
    setNewName((prev) => ({ ...prev, [img.id]: e.target.value }))
  }
/>

        <button onClick={() => handleRename(img.id)}>Save</button>
        <button onClick={() => setEditingId(null)}>Cancel</button>
      </div>
    )}
  </div>
))}
    </div>
  )};
  </div>  
  );
};

export default GalleryPage;

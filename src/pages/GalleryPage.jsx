import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
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
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user images
  useEffect(() => {
    const fetchImages = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, "images"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const imageList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setImages(imageList);
      } catch (error) {
        console.error("Error loading images:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user]);

  // Click outside dropdown closes menu
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
      const newTitle = newName[id] || "";
      await updateDoc(doc(db, "images", id), { name: newTitle });
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, name: newTitle } : img
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
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Filter images by matching tag text
  const filteredImages = searchTerm
    ? images.filter((img) =>
        img.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : images;

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Gallery</h2>

      <input
        type="text"
        placeholder="Search by tag..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="tag-search"
      />

      {loading ? (
        <p>Loading...</p>
      ) : filteredImages.length === 0 ? (
        <p>No images match that tag.</p>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((img) => (
            <div key={img.id} className="gallery-item">
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
                        setNewName((prev) => ({
                          ...prev,
                          [img.id]: img.name,
                        }));
                        setEditingId(img.id);
                        setMenuOpenId(null);
                      }}
                    >
                      ✏️ Rename
                    </button>
                    <button onClick={() => handleDelete(img.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === img.id && (
                <div className="edit-controls">
                  <input
                    value={newName[img.id] || ""}
                    onChange={(e) =>
                      setNewName((prev) => ({
                        ...prev,
                        [img.id]: e.target.value,
                      }))
                    }
                  />
                  <button onClick={() => handleRename(img.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

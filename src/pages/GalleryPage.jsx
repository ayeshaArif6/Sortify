import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import "../Gallery.css";

const GalleryPage = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

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
  
        const imageList = snapshot.docs.map(doc => doc.data());
        setImages(imageList);
      } catch (error) {
        console.error(" Error loading images:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchImages();
  }, [user]);
  

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
              <p>{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

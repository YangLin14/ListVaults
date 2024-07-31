"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Typography,
  Modal,
  Stack,
  TextField,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  query,
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(true);
  const [itemName, setItemName] = useState("");
  const [mode, setMode] = useState("toWatch");

  const updateInventory = async (currentMode) => {
    const snapshot = query(
      collection(firestore, "inventory"),
      where("mode", "==", currentMode)
    );
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (item) => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory(mode);
  };

  const addItem = async (item) => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1, mode });
    }
    await updateInventory(mode);
  };

  useEffect(() => {
    updateInventory(mode);
  }, [mode]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.padding = "10px";
    notification.style.backgroundColor = "rgba(0,0,0,0.7)";
    notification.style.color = "white";
    notification.style.borderRadius = "5px";
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 1000);
  };

  return (
    <>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
        flexDirection="column"
      >
        <Typography variant="h2">Anime List</Typography>
        <Tabs value={mode} onChange={(_, newValue) => setMode(newValue)}>
          <Tab label="To Watch" value="toWatch" />
          <Tab label="Watched" value="watched" />
        </Tabs>
        <Box>
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
        </Box>
        <Box border="1px solid #333">
          <Box
            width="800px"
            height="100px"
            bgcolor="#ADD8E6"
            alignItems="center"
            justifyContent="center"
            display="flex"
          >
            <Box>
              <Typography variant="h4" color="#333">
                {mode === "toWatch" ? "To Watch" : "Watched"} Items
              </Typography>
            </Box>
          </Box>

          <Stack width="800px" height="300px" spacing={2} overflow="auto">
            {inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                height="100px"
                bgcolor="#f0f0f0"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding={5}
              >
                <Typography variant="h4" color="#333" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h4" color="#333" textAlign="center">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" onClick={() => addItem(name)}>
                    Add
                  </Button>
                  <Button variant="outlined" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </>
  );
}

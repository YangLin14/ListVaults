"use client";
import { useState } from "react";
import { Typography, Box, Button, TextField, Stack } from "@mui/material";
import { firestore } from "@/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export default function ToWatch() {
  const [animeName, setAnimeName] = useState("");

  const addToInventory = async (name, rating) => {
    const docRef = doc(firestore, "inventory", name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1, rating });
    } else {
      await setDoc(docRef, { quantity: 1, rating });
    }
    setAnimeName("");
  };

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={4}
    >
      <Typography variant="h2" gutterBottom>
        To Watch
      </Typography>

      {[...Array(10)].map((_, index) => (
        <Box key={index} width="100%" maxWidth="600px" marginY={2}>
          <Typography variant="h4" gutterBottom>
            Recommendation Level: {index + 1}
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Anime Name"
              variant="outlined"
              value={animeName}
              onChange={(e) => setAnimeName(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => addToInventory(animeName, index + 1)}
            >
              Add to Inventory
            </Button>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

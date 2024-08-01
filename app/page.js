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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import Script from "next/script";

export default function Home() {
  const [toWatch, setToWatch] = useState([]);
  const [watched, setWatched] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [mode, setMode] = useState("toWatch");
  const [priority, setPriority] = useState(1);
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [isCustomGenre, setIsCustomGenre] = useState(false);

  const predefinedGenres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Thriller",
  ];

  const updateLists = async () => {
    const toWatchSnapshot = await getDocs(collection(firestore, "to-watch"));
    const watchedSnapshot = await getDocs(collection(firestore, "watched"));

    const toWatchList = [];
    toWatchSnapshot.forEach((doc) => {
      toWatchList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setToWatch(toWatchList.sort((a, b) => a.priority - b.priority));

    const watchedList = [];
    watchedSnapshot.forEach((doc) => {
      watchedList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setWatched(watchedList.sort((a, b) => a.priority - b.priority));
  };

  const removeItem = async (item) => {
    const docRef = doc(
      firestore,
      mode === "toWatch" ? "to-watch" : "watched",
      item
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { genre, priority } = docSnap.data();
      await deleteDoc(docRef);
      if (mode === "toWatch") {
        // Move the item to the "watched" collection
        const watchedDocRef = doc(firestore, "watched", item);
        await setDoc(watchedDocRef, {
          genre,
          priority,
        });
      }
    }
    await updateLists();
  };

  const addItem = async (item) => {
    const docRef = doc(
      firestore,
      mode === "toWatch" ? "to-watch" : "watched",
      item
    );
    const finalGenre = isCustomGenre ? customGenre : genre;
    await setDoc(docRef, { priority, genre: finalGenre });
    await updateLists();
    handleClose();
  };

  useEffect(() => {
    updateLists();
  }, [mode]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setPriority(1);
    setGenre("");
    setCustomGenre("");
    setIsCustomGenre(false);
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
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-VP3XJ43XJ4"
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-VP3XJ43XJ4');
        `}
      </Script>
      <Box
        width="100%"
        minHeight="100vh"
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        gap={2}
        flexDirection="column"
        sx={{
          background: "linear-gradient(to bottom right, #f5f5f5, #e8e8e8)",
          padding: "20px",
          overflowX: "hidden",
        }}
      >
        <Box display="flex" alignItems="center" gap={2} marginTop="20px">
          <Box
            position="relative"
            width="100px"
            height="100px"
            sx={{
              "@media (max-width: 600px)": {
                width: "60px",
                height: "60px",
              },
            }}
          >
            <Image
              src="/favicon.ico"
              alt="ViewVault Logo"
              layout="fill"
              objectFit="contain"
              style={{ borderRadius: "20px" }}
            />
          </Box>
          <Typography
            variant="h2"
            sx={{
              "@media (max-width: 600px)": {
                fontSize: "2rem",
              },
            }}
          >
            Anime Lists
          </Typography>
        </Box>
        <Tabs value={mode} onChange={(_, newValue) => setMode(newValue)}>
          <Tab label="To Watch" value="toWatch" />
          <Tab label="Watched" value="watched" />
        </Tabs>
        <Box>
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
        </Box>
        <Box
          border="1px solid #333"
          sx={{
            backgroundColor: "#ffffff",
            width: "100%",
            maxWidth: "1200px",
            maxHeight: "600px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            width="100%"
            bgcolor="#ADD8E6"
            alignItems="center"
            justifyContent="center"
            display="flex"
            padding="20px"
          >
            <Typography
              variant="h4"
              color="#333"
              sx={{
                "@media (max-width: 600px)": {
                  fontSize: "1.5rem",
                },
              }}
            >
              {mode === "toWatch" ? "To Watch" : "Watched"} Items
            </Typography>
          </Box>

          <Box
            width="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            padding={2}
            bgcolor="#f0f0f0"
          >
            <Typography variant="h6" color="#333" textAlign="center" flex={1}>
              Name
            </Typography>
            <Typography variant="h6" color="#333" textAlign="center" flex={1}>
              Genre
            </Typography>
            <Typography variant="h6" color="#333" textAlign="center" flex={1}>
              Priority
            </Typography>
            <Typography variant="h6" color="#333" textAlign="center" flex={1}>
              Action
            </Typography>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
            }}
          >
            <Stack width="100%" spacing={2}>
              {(mode === "toWatch" ? toWatch : watched).map(
                ({ name, priority, genre }) => (
                  <Box
                    key={name}
                    width="100%"
                    bgcolor="#f0f0f0"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    padding={2}
                  >
                    <Typography
                      variant="body1"
                      color="#333"
                      textAlign="center"
                      flex={1}
                      sx={{
                        "@media (max-width: 600px)": {
                          marginBottom: "10px",
                        },
                      }}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="#333"
                      textAlign="center"
                      flex={1}
                      sx={{
                        "@media (max-width: 600px)": {
                          marginBottom: "10px",
                        },
                      }}
                    >
                      {genre}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="#333"
                      textAlign="center"
                      flex={1}
                      sx={{
                        "@media (max-width: 600px)": {
                          marginBottom: "10px",
                        },
                      }}
                    >
                      {priority}
                    </Typography>
                    <Box
                      flex={1}
                      display="flex"
                      justifyContent="center"
                      sx={{
                        "@media (max-width: 600px)": {
                          width: "100%",
                        },
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (mode === "toWatch") {
                            removeItem(name);
                            showNotification(`${name} moved to Watched list`);
                          } else {
                            removeItem(name);
                            showNotification(
                              `${name} removed from Watched list`
                            );
                          }
                        }}
                      >
                        {mode === "toWatch" ? "Move to Watched" : "Remove"}
                      </Button>
                    </Box>
                  </Box>
                )
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            "@media (max-width: 600px)": {
              width: "90%",
            },
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Add New {mode === "toWatch" ? "To Watch" : "Watched"}
          </Typography>
          <TextField
            fullWidth
            label="Anime Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Genre</InputLabel>
            <Select
              value={genre}
              label="Genre"
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setIsCustomGenre(true);
                  setGenre("");
                } else {
                  setIsCustomGenre(false);
                  setGenre(e.target.value);
                }
              }}
            >
              {predefinedGenres.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
              <MenuItem value="custom">Add Custom Genre</MenuItem>
            </Select>
          </FormControl>
          {isCustomGenre && (
            <TextField
              fullWidth
              label="Custom Genre"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              margin="normal"
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              {[...Array(10)].map((_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {index + 1}{" "}
                  {index === 0 ? "(Most)" : index === 9 ? "(Least)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => addItem(itemName)}
            sx={{ mt: 2 }}
          >
            Add Item
          </Button>
        </Box>
      </Modal>
    </>
  );
}

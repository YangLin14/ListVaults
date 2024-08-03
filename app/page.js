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
  Menu,
  MenuItem as MuiMenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(true); // Open signup modal by default
  const [itemName, setItemName] = useState("");
  const [mode, setMode] = useState("toWatch");
  const [priority, setPriority] = useState(1);
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [releaseDate, setReleaseDate] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [notes, setNotes] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [listAnchorEl, setListAnchorEl] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [listToRemove, setListToRemove] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);

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
    if (!user || !selectedList) return;

    const toWatchSnapshot = await getDocs(
      collection(firestore, `users/${user}/list-names/${selectedList}/to-watch`)
    );
    const watchedSnapshot = await getDocs(
      collection(firestore, `users/${user}/list-names/${selectedList}/watched`)
    );

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

  const updateListNames = async () => {
    if (!user) return;

    const listNamesSnapshot = await getDocs(
      collection(firestore, `users/${user}/list-names`)
    );

    const listNames = [];
    listNamesSnapshot.forEach((doc) => {
      listNames.push(doc.id);
    });
    setLists(listNames);
  };

  const removeItem = async (item) => {
    if (!user || !selectedList) return;

    const docRef = doc(
      firestore,
      `users/${user}/list-names/${selectedList}/${
        mode === "toWatch" ? "to-watch" : "watched"
      }`,
      item
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    }
    await updateLists();
  };

  const moveItemToWatched = async (item) => {
    if (!user || !selectedList) return;

    const docRef = doc(
      firestore,
      `users/${user}/list-names/${selectedList}/to-watch`,
      item
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { genre, priority, releaseDate, episodes, notes } = docSnap.data();
      await deleteDoc(docRef);
      const watchedDocRef = doc(
        firestore,
        `users/${user}/list-names/${selectedList}/watched`,
        item
      );
      await setDoc(watchedDocRef, {
        genre,
        priority,
        releaseDate,
        episodes,
        notes,
      });
    }
    await updateLists();
    showNotification(`${item} moved to Watched list`);
  };

  const addItem = async (item) => {
    if (!user || !selectedList) return;

    const docRef = doc(
      firestore,
      `users/${user}/list-names/${selectedList}/${
        mode === "toWatch" ? "to-watch" : "watched"
      }`,
      item
    );
    const finalGenre = isCustomGenre ? customGenre : genre;
    await setDoc(docRef, {
      priority,
      genre: finalGenre,
      releaseDate,
      episodes,
      notes,
      customCategories,
    });
    await updateLists();
    handleClose();
  };

  const editItemInFirebase = async (item) => {
    if (!user || !selectedList) return;

    const docRef = doc(
      firestore,
      `users/${user}/list-names/${selectedList}/${
        mode === "toWatch" ? "to-watch" : "watched"
      }`,
      item.name
    );
    const finalGenre = isCustomGenre ? customGenre : genre;
    await updateDoc(docRef, {
      priority,
      genre: finalGenre,
      releaseDate,
      episodes,
      notes,
      customCategories,
    });
    await updateLists();
    handleEditClose();
  };

  const removeItemFromFirebase = async (item) => {
    if (!user || !selectedList) return;

    const docRef = doc(
      firestore,
      `users/${user}/list-names/${selectedList}/${
        mode === "toWatch" ? "to-watch" : "watched"
      }`,
      item.name
    );
    await deleteDoc(docRef);
    await updateLists();
    handleEditClose();
  };

  const removeListFromFirebase = async (listName) => {
    if (!user) return;

    const listDocRef = doc(firestore, `users/${user}/list-names`, listName);
    await deleteDoc(listDocRef);
    await updateListNames();
    setSelectedList("");
  };

  useEffect(() => {
    if (user) {
      updateLists();
      updateListNames();
    }
  }, [mode, user, selectedList]);

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
    setReleaseDate("");
    setEpisodes("");
    setNotes("");
    setCustomCategories([]);
  };

  const handleEditOpen = (item) => {
    setEditItem(item);
    setItemName(item.name);
    setPriority(item.priority);
    setGenre(item.genre);
    setReleaseDate(item.releaseDate);
    setEpisodes(item.episodes);
    setNotes(item.notes);
    setIsCustomGenre(false);
    setCustomCategories(item.customCategories || []);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditItem(null);
    setItemName("");
    setPriority(1);
    setGenre("");
    setCustomGenre("");
    setReleaseDate("");
    setEpisodes("");
    setNotes("");
    setIsCustomGenre(false);
    setCustomCategories([]);
  };

  const handleLoginOpen = () => {
    setLoginOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
    setLoginError("");
  };

  const handleSignupOpen = () => {
    setSignupOpen(true);
  };

  const handleSignupClose = () => {
    setSignupOpen(false);
    setSignupError("");
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

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
    setUser(null);
    setToWatch([]);
    setWatched([]);
    setLists([]);
    setSelectedList("");
    handleMenuClose();
  };

  const handleLogin = async () => {
    const userName = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const userDocRef = doc(firestore, "users", userName);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().password === password) {
      setUser(userName);
      console.log("User logged in");
      handleMenuClose();
      handleLoginClose();
      updateLists(); // Load data after login
      updateListNames(); // Load list names after login
    } else {
      setLoginError("Incorrect username or password");
    }
  };

  const handleSignup = async () => {
    const userName = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    const userDocRef = doc(firestore, "users", userName);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setSignupError("Username already exists. Directing to login.");
      setTimeout(() => {
        handleSignupClose();
        handleLoginOpen();
      }, 2000);
    } else {
      await setDoc(userDocRef, { password });
      setUser(userName);
      console.log("User signed up and logged in");
      handleMenuClose();
      handleSignupClose();
      updateLists(); // Load data after signup
      updateListNames(); // Load list names after signup
    }
  };

  const handleListClick = (event) => {
    setListAnchorEl(event.currentTarget);
  };

  const handleListMenuClose = () => {
    setListAnchorEl(null);
  };

  const handleAddList = async () => {
    if (newListName.trim() !== "") {
      const listDocRef = doc(
        firestore,
        `users/${user}/list-names`,
        newListName
      );
      await setDoc(listDocRef, {});
      setLists((prevLists) => [...prevLists, newListName]);
      setNewListName("");
      setSelectedList(newListName); // Automatically select the new list
    }
  };

  const handleListNameClick = (listName) => {
    setSelectedList(listName);
    handleListMenuClose();
  };

  const handleConfirmOpen = (item) => {
    setItemToRemove(item);
    if (mode === "toWatch") {
      setConfirmMessage(`Move ${item} to the Watched list?`);
    } else {
      setConfirmMessage(`Are you sure to remove ${item}?`);
    }
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmRemove = () => {
    if (mode === "toWatch") {
      moveItemToWatched(itemToRemove);
      showNotification(`${itemToRemove} moved to Watched list`);
    } else {
      removeItem(itemToRemove);
      showNotification(`${itemToRemove} removed`);
    }
    setConfirmOpen(false);
    handleEditClose(); // Close the edit menu after confirming removal
  };

  const handleConfirmRemoveList = () => {
    removeListFromFirebase(listToRemove);
    showNotification(`${listToRemove} list removed`);
    setConfirmOpen(false);
  };

  const handleAddCategory = () => {
    setCustomCategories((prevCategories) => [
      ...prevCategories,
      { name: "", value: "" },
    ]);
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...customCategories];
    updatedCategories[index][field] = value;
    setCustomCategories(updatedCategories);
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = customCategories.filter((_, i) => i !== index);
    setCustomCategories(updatedCategories);
  };

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-F6ZZF7ELH5"
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-F6ZZF7ELH5');
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          padding="20px"
        >
          <Link href="/">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                position="relative"
                width="90px"
                height="90px"
                sx={{
                  transition: "box-shadow 0.3s ease-in-out",
                  borderRadius: "20px",
                  "&:hover": {
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                  },
                  "@media (max-width: 600px)": {
                    width: "70px",
                    height: "70px",
                    marginLeft: "-20px",
                  },
                }}
              >
                <Image
                  src="/logo.png"
                  alt="ViewVault Logo"
                  fill
                  style={{ borderRadius: "50px", objectFit: "contain" }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  "@media (max-width: 600px)": {
                    fontSize: "1.3rem",
                    marginLeft: "-10px",
                  },
                }}
              >
                ListVaults
              </Typography>
            </Box>
          </Link>
          <Box display="flex" alignItems="center" gap={6}>
            <Box>
              <Typography
                variant="h7"
                sx={{
                  cursor: "pointer",
                  position: "relative",
                  marginLeft: "10px",
                  color: "#666",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                  "@media (max-width: 600px)": {
                    fontSize: "1rem",
                    marginLeft: "5px",
                  },
                }}
                onClick={handleListClick}
              >
                Lists
              </Typography>
              <Menu
                anchorEl={listAnchorEl}
                open={Boolean(listAnchorEl)}
                onClose={handleListMenuClose}
                sx={{
                  marginLeft: "-20px",
                  marginTop: "10px",
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  padding="10px"
                >
                  {lists.map((list, index) => (
                    <Box
                      key={list}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                      sx={{
                        marginBottom: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: "center",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                          },
                        }}
                        onClick={() => handleListNameClick(list)}
                      >
                        {list.charAt(0).toUpperCase() +
                          list.slice(1).toLowerCase()}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setConfirmMessage(`Are you sure to remove ${list}?`);
                          setListToRemove(list);
                          setConfirmOpen(true);
                        }}
                        sx={{
                          marginLeft: "2px",
                          fontSize: "0.8rem",
                          padding: "2px 5px",
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <TextField
                    fullWidth
                    label="New List Name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddList}
                    sx={{ marginTop: "10px" }}
                  >
                    Add To Lists
                  </Button>
                </Box>
              </Menu>
            </Box>
            <Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="50px"
                height="50px"
                sx={{
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  transition: "box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                  },
                  "@media (max-width: 600px)": {
                    width: "40px",
                    height: "40px",
                  },
                }}
                onClick={handleProfileClick}
              >
                <Image
                  src="/profile-pic.png"
                  alt="User Profile"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  padding="10px"
                >
                  <Box
                    width="100px"
                    height="100px"
                    sx={{
                      borderRadius: "50%",
                      overflow: "hidden",
                      position: "relative",
                      marginBottom: "10px",
                    }}
                  >
                    <Image
                      src="/profile-pic.png"
                      alt="User Profile"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                  <Typography variant="h6">
                    {user ? user : "User Name"}
                  </Typography>
                  {!user && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleLoginOpen}
                      sx={{ marginTop: "10px" }}
                    >
                      Log In
                    </Button>
                  )}
                  {!user && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleSignupOpen}
                      sx={{ marginTop: "10px" }}
                    >
                      Sign Up
                    </Button>
                  )}
                  {user && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleLogout}
                      sx={{ marginTop: "10px" }}
                    >
                      Log Out
                    </Button>
                  )}
                </Box>
              </Menu>
            </Box>
          </Box>
        </Box>
        {user && selectedList && (
          <Typography
            variant="h2"
            color="#333"
            sx={{
              marginTop: "-30px",
              "@media (max-width: 600px)": {
                fontSize: "1.5rem",
              },
            }}
          >
            {selectedList}
          </Typography>
        )}
        <Tabs value={mode} onChange={(_, newValue) => setMode(newValue)}>
          <Tab label="To Watch" value="toWatch" />
          <Tab label="Watched" value="watched" />
        </Tabs>
        <Box>
          {lists.length === 0 ? (
            <Button variant="contained" onClick={handleListClick}>
              Add New List
            </Button>
          ) : (
            <Button variant="contained" onClick={handleOpen}>
              Add New Item
            </Button>
          )}
        </Box>
        <Box
          border="1px solid #333"
          sx={{
            backgroundColor: "#ffffff",
            width: "100%",
            maxWidth: "1400px", // Make the container for the items wider
            maxHeight: "1000px",
            display: "flex",
            flexDirection: "column",
            overflowX: "auto", // Make the container scrollable in horizontal direction
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
            display="flex"
            flexDirection="column"
            sx={{
              "@media (max-width: 600px)": {
                flexDirection: "row",
              },
            }}
          >
            {/* Category Container */}
            <Box
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              padding={2}
              bgcolor="#e0e0e0"
            >
              {[
                "Name",
                "Genre",
                "Episodes",
                "Priority",
                "Date",
                "Notes",
                ...customCategories.map((cat) => cat.name),
                "Action",
              ].map((header, index) => (
                <Typography
                  key={index}
                  variant="h6"
                  color="#333"
                  textAlign="center"
                  flex={1}
                  sx={{
                    "@media (max-width: 600px)": {
                      fontSize: "0.8rem",
                    },
                  }}
                >
                  {header}
                </Typography>
              ))}
            </Box>

            {/* Item Container */}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              {(mode === "toWatch" ? toWatch : watched).map(
                (item, rowIndex) => (
                  <Box
                    key={rowIndex}
                    width="100%"
                    bgcolor={rowIndex % 2 === 0 ? "#f0f0f0" : "#ffffff"}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    padding={2}
                  >
                    {[
                      item.name,
                      item.genre,
                      item.episodes,
                      item.priority,
                      item.releaseDate,
                      item.notes,
                      ...customCategories.map((cat) => {
                        const categoryItem = item.customCategories.find(
                          (c) => c.name === cat.name
                        );
                        return categoryItem ? categoryItem.value : "";
                      }),
                      <Box key="actions" display="flex" justifyContent="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditOpen(item)}
                          sx={{ mr: 2 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleConfirmOpen(item.name)}
                        >
                          {mode === "toWatch" ? "Watched" : "Remove"}
                        </Button>
                      </Box>,
                    ].map((cell, cellIndex) => (
                      <Typography
                        key={cellIndex}
                        variant="body1"
                        color="#333"
                        textAlign="center"
                        flex={1}
                        sx={{
                          "@media (max-width: 600px)": {
                            fontSize: "0.8rem",
                          },
                        }}
                      >
                        {cell}
                      </Typography>
                    ))}
                  </Box>
                )
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Add New Item Menu*/}
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
            maxHeight: "90vh",
            overflowY: "auto",
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
          <TextField
            fullWidth
            label="Episodes"
            value={episodes}
            onChange={(e) => setEpisodes(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Release Date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
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
          {customCategories.map((category, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={2}
              margin="normal"
            >
              <TextField
                fullWidth
                label="Category Name"
                value={category.name}
                onChange={(e) =>
                  handleCategoryChange(index, "name", e.target.value)
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Category Value"
                value={category.value}
                onChange={(e) =>
                  handleCategoryChange(index, "value", e.target.value)
                }
                margin="normal"
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleRemoveCategory(index)}
              >
                Remove
              </Button>
            </Box>
          ))}

          <Box display="flex" gap={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
            <Button variant="outlined" size="small" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => addItem(itemName)}
            >
              Add Item
            </Button>
          </Box>
        </Box>
      </Modal>
      {/* Edit Item Menu*/}
      <Modal open={editOpen} onClose={() => {}}>
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
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Edit {mode === "toWatch" ? "To Watch" : "Watched"} Item
          </Typography>
          <TextField
            fullWidth
            label="Anime Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            margin="normal"
            disabled
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
          <TextField
            fullWidth
            label="Episodes"
            value={episodes}
            onChange={(e) => setEpisodes(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Release Date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
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
          {customCategories.map((category, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={2}
              margin="normal"
            >
              <TextField
                fullWidth
                label="Category Name"
                value={category.name}
                onChange={(e) =>
                  handleCategoryChange(index, "name", e.target.value)
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Category Value"
                value={category.value}
                onChange={(e) =>
                  handleCategoryChange(index, "value", e.target.value)
                }
                margin="normal"
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleRemoveCategory(index)}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button
            variant="contained"
            size="small"
            onClick={handleAddCategory}
            sx={{ mt: 2, backgroundColor: "green" }}
          >
            Add Category
          </Button>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ mt: 2, gap: 1 }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => editItemInFirebase(editItem)}
            >
              Save Changes
            </Button>
            <Button variant="outlined" size="small" onClick={handleEditClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                setConfirmMessage(`Are you sure to remove ${editItem.name}?`);
                removeItem(editItem.name);
                showNotification(`${editItem.name} removed`);
                handleEditClose();
              }}
            >
              Remove Item
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal open={loginOpen} onClose={() => {}}>
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
            Login
          </Typography>
          <TextField
            fullWidth
            label="User Name"
            id="login-username"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            id="login-password"
            margin="normal"
          />
          {loginError && (
            <Typography variant="body2" color="error" gutterBottom>
              {loginError}
            </Typography>
          )}
          <Button variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>
            Login
          </Button>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              marginTop: "10px",
              position: "absolute",
              bottom: "40px",
              right: "40px",
            }}
            onClick={() => {
              handleLoginClose();
              handleSignupOpen();
            }}
          >
            New user? Sign up
          </Typography>
        </Box>
      </Modal>
      <Modal open={signupOpen} onClose={() => {}}>
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
            Sign Up
          </Typography>
          <TextField
            fullWidth
            label="User Name"
            id="signup-username"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            id="signup-password"
            margin="normal"
          />
          {signupError && (
            <Typography variant="body2" color="error" gutterBottom>
              {signupError}
            </Typography>
          )}
          <Button variant="contained" onClick={handleSignup} sx={{ mt: 2 }}>
            Sign Up
          </Button>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: "pointer",
              position: "absolute",
              bottom: "40px",
              right: "40px",
              textDecoration: "underline",
            }}
            onClick={() => {
              handleSignupClose();
              handleLoginOpen();
            }}
          >
            Existing user? Log in
          </Typography>
        </Box>
      </Modal>
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Action"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={
              listToRemove ? handleConfirmRemoveList : handleConfirmRemove
            }
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

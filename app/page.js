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
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [listAnchorEl, setListAnchorEl] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState("");

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
      const { genre, priority } = docSnap.data();
      await deleteDoc(docRef);
      if (mode === "toWatch") {
        // Move the item to the "watched" collection
        const watchedDocRef = doc(
          firestore,
          `users/${user}/list-names/${selectedList}/watched`,
          item
        );
        await setDoc(watchedDocRef, {
          genre,
          priority,
        });
      }
    }
    await updateLists();
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
    await setDoc(docRef, { priority, genre: finalGenre });
    await updateLists();
    handleClose();
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
      setSignupError("Username already exists. Logging in...");
      handleLogin();
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
      setLists([...lists, newListName]);
      setNewListName("");
    }
  };

  const handleListNameClick = (listName) => {
    setSelectedList(listName);
    handleListMenuClose();
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
                width="70px"
                height="70px"
                sx={{
                  transition: "box-shadow 0.3s ease-in-out",
                  borderRadius: "20px",
                  "&:hover": {
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                  },
                  "@media (max-width: 600px)": {
                    width: "50px",
                    height: "50px",
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
                variant="h5"
                sx={{
                  "@media (max-width: 600px)": {
                    fontSize: "1.5rem",
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
                  marginLeft: "20px",
                  color: "#666",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                  "@media (max-width: 600px)": {
                    fontSize: "1rem",
                    marginLeft: "10px",
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
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  padding="10px"
                >
                  {lists.map((list, index) => (
                    <Typography
                      key={index}
                      variant="body1"
                      sx={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => handleListNameClick(list)}
                    >
                      {list}
                    </Typography>
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
                    Add List
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
                  layout="fill"
                  objectFit="cover"
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
                      layout="fill"
                      objectFit="cover"
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
      <Modal open={loginOpen} onClose={handleLoginClose}>
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
    </>
  );
}

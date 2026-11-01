import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as SecureStore from "expo-secure-store";
import api, { setApiToken } from "./api";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await SecureStore.getItemAsync("gadgetcrate_token");

        if (savedToken) {
          setApiToken(savedToken);
          setToken(savedToken);
        }
      } catch (err) {
        console.log("Gagal membaca token", err);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!token) return;

    api.get("/products")
      .then((response) => setProducts(response.data.products))
      .catch(() => setError("Gagal mengambil produk dari server."));
  }, [token]);

  async function login() {
    try {
      setError("");
      const response = await api.post("/auth/login", { email, password });
      const newToken = response.data.token;

      await SecureStore.setItemAsync("gadgetcrate_token", newToken);
      setApiToken(newToken);
      setToken(newToken);
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync("gadgetcrate_token");
    setApiToken(null);
    setToken(null);
    setProducts([]);
    setSelected(null);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loginBox}>
          <Text style={styles.brand}>GadgetCrate</Text>
          <Text style={styles.heading}>Login ke akunmu</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>GadgetCrate</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.link}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {selected ? (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.link}>‹ Kembali ke produk</Text>
          </TouchableOpacity>
          <Image source={{ uri: selected.imageUrl }} style={styles.detailImage} />
          <Text style={styles.category}>{selected.category}</Text>
          <Text style={styles.heading}>{selected.name}</Text>
          <Text style={styles.price}>{rupiah(selected.price)}</Text>
          <Text style={styles.description}>{selected.description}</Text>
          <Text>Stok: {selected.stock}</Text>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Daftar Produk</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}

          {products.map((product) => (
            <TouchableOpacity
              style={styles.card}
              key={product._id}
              onPress={() => setSelected(product)}
            >
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              <View style={styles.cardBody}>
                <Text style={styles.category}>{product.category}</Text>
                <Text style={styles.cardTitle}>{product.name}</Text>
                <Text style={styles.price}>{rupiah(product.price)}</Text>
                <Text>Lihat detail ›</Text>
              </View>
            </TouchableOpacity>
          ))}

          {!products.length && !error && <ActivityIndicator />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f7fb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loginBox: { flex: 1, justifyContent: "center", padding: 24 },
  header: {
    padding: 18,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  content: { padding: 18, gap: 14 },
  brand: { fontSize: 23, fontWeight: "800", color: "#2056d8" },
  heading: { fontSize: 24, fontWeight: "700", marginVertical: 8, color: "#18212f" },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#cbd2df",
    borderRadius: 10,
    padding: 13,
    marginVertical: 7
  },
  button: {
    backgroundColor: "#2056d8",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 8
  },
  buttonText: { color: "white", fontWeight: "700" },
  link: { color: "#2056d8", fontWeight: "700" },
  error: { color: "#b42318", marginVertical: 8 },
  card: { backgroundColor: "white", borderRadius: 14, overflow: "hidden", marginBottom: 6 },
  productImage: { width: "100%", height: 190, backgroundColor: "#edf0f5" },
  detailImage: { width: "100%", height: 270, borderRadius: 14, backgroundColor: "#edf0f5" },
  cardBody: { padding: 15, gap: 5 },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  category: { color: "#59677b" },
  price: { color: "#2056d8", fontSize: 18, fontWeight: "700" },
  description: { fontSize: 16, lineHeight: 24 }
});
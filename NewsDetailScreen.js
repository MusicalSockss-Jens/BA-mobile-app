import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { renderHtml } from "../utils/htmlRenderer";

export default function NewsDetailScreen({ route, navigation }) {
  const item = route.params?.item ?? {};
  const fieldData = item.fieldData || {};

  const title =
    fieldData.name || item.name || fieldData.slug || "Nieuwsbericht";
  const body =
    fieldData["post-body"] || fieldData.post_body || fieldData.postBody || "";
  const mainImage =
    fieldData["main-image"] ||
    fieldData["Main Image"] ||
    fieldData.image ||
    null;
  const extraImages = fieldData["extra-images"] || fieldData.extra_images || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Terug</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {mainImage ? (
        <Image
          source={{ uri: mainImage.url || mainImage }}
          style={styles.mainImage}
        />
      ) : null}

      {Array.isArray(extraImages) && extraImages.length > 0 ? (
        <View style={styles.extraImagesRow}>
          {extraImages.map((image, index) => {
            const uri = image?.url || image;
            if (!uri) return null;
            return (
              <Image key={index} source={{ uri }} style={styles.extraImage} />
            );
          })}
        </View>
      ) : null}

      <View style={styles.bodyContainer}>{renderHtml(body)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: "#007AFF" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  mainImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  bodyContainer: { marginTop: 8 },
  extraImagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  extraImage: {
    width: "48%",
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  body: { fontSize: 16, color: "#333", lineHeight: 24 },
});

<template>
  <q-page>
    <div class="flex row">
      <div class="col-4 q-pa-md">
        Upload pictures (multiple is allowed)
        <q-file filled v-model="imageToUpload" label="Open images" multiple>
          <template v-slot:prepend>
            <q-icon name="cloud_upload" />
          </template>
        </q-file>
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Upload"
          @click="uploadImage"
        />
      </div>
      <div class="col-4">
        <q-card-section :style="{height: '720px'}" class="bg-grey-4 scroll-x">
          Choose a picture to compare
          <div class="flex row q-ma-md">
            <q-card
              class="q-ma-xs items-center cursor-pointer bg-transparent"
              v-for="{id, url} in imageUrls" :key="url"
              :style="{ width: '150px' }"
              @click="selectImageToCompare(id)"
            >
              <q-img
                class="col-5"
                :src="url"
                :fit="'contain'"
              >
                <div
                  class="absolute-bottom text-subtitle2 flex flex-center"
                  :style="{ height: '50%' }"
                  v-if="selectedImageId && selectedImageId !== id"
                >
                  {{ Math.round(comparisonMap[id] * 100) / 100}}
                </div>
              </q-img>
            </q-card>
          </div>
        </q-card-section>
      </div>

      <div class="col-4 q-pa-md" v-if="selectedImageId">
        <p>This picture below</p>
        <q-img
          :src="generateImageUrl(selectedImageId)"
          :fit="'contain'"
          :style="{ height: '320px' }"
        />
        <p>looks like these pictures (similarity between 0 and 1)</p>
        <q-card-section class="bg-grey-3">
          <div class="flex row q-ma-md">
            <q-card
              class="q-ma-xs items-center cursor-pointer bg-transparent"
              v-for="{id, url} in topImageUrls" :key="url"
              :style="{ width: '150px' }"
            >
              <q-img
                class="col-5"
                :src="url"
                :fit="'contain'"
              >
                <div
                  class="absolute-bottom text-subtitle2 flex flex-center"
                  :style="{ height: '50%' }"
                  v-if="selectedImageId && selectedImageId !== id"
                >
                  {{ Math.round(comparisonMap[id] * 100) / 100}}
                </div>
              </q-img>
            </q-card>
          </div>
        </q-card-section>
      </div>
    </div>
  </q-page>
</template>

<script>
import { computed, defineComponent, ref } from 'vue';
import {
  compareImageToOthers, createImageVector, getImageIds, IMAGE_HOSTING_URL,
} from 'src/api';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const topLimit = 5;

    const imageIds = ref([]);
    const imageToUpload = ref(null);

    const comparisonMap = ref({});
    const selectedImageId = ref('');
    const topImageUrls = ref([]);

    function generateImageUrl(id) {
      return `${IMAGE_HOSTING_URL}${id}.jpg`;
    }

    const imageUrls = computed(() => imageIds.value.map((id) => ({ id, url: generateImageUrl(id) })));

    function fetchImages() {
      getImageIds().then((data) => {
        imageIds.value = data.map(({ h }) => h);
      });
    }

    fetchImages();

    async function fetchImageComparison() {
      comparisonMap.value = await compareImageToOthers(selectedImageId.value);

      topImageUrls.value = Object.entries(comparisonMap.value)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topLimit)
        .map(([id]) => ({ id, url: `${IMAGE_HOSTING_URL}${id}.jpg` }));
    }

    const selectImageToCompare = async (imageId) => {
      selectedImageId.value = imageId;
      await fetchImageComparison();
    };

    const uploadImage = async () => {
      Promise.all(imageToUpload.value.map((f) => createImageVector(f))).then(() => {
        fetchImages();
        fetchImageComparison();
      });
    };

    return {
      imageToUpload,
      imageIds,
      IMAGE_HOSTING_URL,
      selectImageToCompare,
      imageUrls,
      comparisonMap,
      selectedImageId,
      topImageUrls,
      uploadImage,
      generateImageUrl,
    };
  },
});
</script>

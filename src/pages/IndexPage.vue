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

        <div class="flex q-mt-xl">
          <q-select
            v-model="currentModel"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredModels"
            @filter="modelFilterFn"
            style="width: 250px"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-btn
            class="q-mt-md"
            color="primary"
            label="Refresh"
            type="submit"
            @click="setModel"
          />
        </div>
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
        <div class="flex">
          <q-form @submit="getImageComparison">
            <q-input
              label="Number of similar pictures"
              v-model="topLimit"
              type="number"
            />
            <q-btn
              class="q-mt-md"
              color="primary"
              label="Refresh"
              type="submit"
              @click="getImageComparison"
            />
          </q-form>
        </div>
        <q-separator class="q-mt-lg"/>
        <p class="q-mt-lg">This picture below</p>
        <q-img
          :src="generateImageUrl(selectedImageId)"
          :fit="'contain'"
          :style="{ height: '250px' }"
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
                  {{ (Math.round(comparisonMap[id] * 100) / 100).toFixed(2) }}
                </div>
              </q-img>
            </q-card>
          </div>
        </q-card-section>
      </div>
      <q-inner-loading
        :showing="settingCurrentModelLoading"
        :label="'Setting current model and recalculating image vectors...'"
        label-class="text-red text-weight-bold"
        label-style="font-size: 1.1em; text-weight: bold"
      />
    </div>
  </q-page>
</template>

<script>
import { computed, defineComponent, ref } from 'vue';
import {
  compareImageToOthers,
  createImageVector,
  fetchCurrentModel,
  fetchImageIds,
  fetchModels,
  IMAGE_HOSTING_URL,
  setCurrentModel,
} from 'src/api';
import useNotifications from 'src/composables/use-notifications';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const { notifyPositive, notifyNegative } = useNotifications();

    const topLimit = ref(5);

    const imageIds = ref([]);
    const imageToUpload = ref(null);

    const comparisonMap = ref({});
    const selectedImageId = ref('');
    const topImageUrls = ref([]);

    function generateImageUrl(id) {
      return `${IMAGE_HOSTING_URL}${id}.jpg`;
    }

    const imageUrls = computed(() => imageIds.value.map((id) => ({ id, url: generateImageUrl(id) })));

    function getImages() {
      fetchImageIds().then((data) => {
        imageIds.value = data.map(({ h }) => h);
      });
    }

    getImages();

    async function getImageComparison() {
      comparisonMap.value = await compareImageToOthers(selectedImageId.value);

      topImageUrls.value = Object.entries(comparisonMap.value)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topLimit.value)
        .map(([id]) => ({ id, url: `${IMAGE_HOSTING_URL}${id}.jpg` }));
    }

    const selectImageToCompare = async (imageId) => {
      selectedImageId.value = imageId;
      await getImageComparison();
    };

    const fetchImagesWithComparison = () => {
      getImages();
      if (selectedImageId.value) {
        getImageComparison();
      }
    };

    const uploadImage = async () => {
      Promise.all(imageToUpload.value.map((f) => createImageVector(f))).then(() => {
        fetchImagesWithComparison();
      });
    };

    const settingCurrentModelLoading = ref(false);
    const currentModel = ref(null);
    const availableModels = ref([]);
    const filteredModels = ref([]);
    const setModel = async () => {
      settingCurrentModelLoading.value = true;
      setCurrentModel(currentModel.value).then(() => {
        fetchImagesWithComparison();
        notifyPositive('Model has been set');
      }).catch(() => {
        notifyNegative('Model has not been set due to an error, check backend logs');
      }).finally(() => {
        settingCurrentModelLoading.value = false;
      });
    };
    const modelFilterFn = (val, update) => {
      update(() => {
        const needle = val.toLowerCase();
        filteredModels.value = availableModels.value.filter((v) => v.toLowerCase().indexOf(needle) > -1);
      });
    };
    fetchCurrentModel().then(({ model }) => {
      currentModel.value = model;
    });
    fetchModels().then(({ models }) => {
      availableModels.value = models;
    });

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
      topLimit,
      getImageComparison,
      setModel,
      currentModel,
      availableModels,
      filteredModels,
      modelFilterFn,
      settingCurrentModelLoading,
    };
  },
});
</script>

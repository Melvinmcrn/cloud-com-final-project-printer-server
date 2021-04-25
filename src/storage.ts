import {Storage} from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: 'serviceAccountKey.json',
  projectId: process.env.PROJECT_ID,
});
const bucketName = process.env.BUCKET_NAME || '';

const getImageFromStorage = async (fileName: string): Promise<Buffer> => {
  try {
    const file: Buffer[] = await storage
      .bucket(bucketName)
      .file(`product_image/${fileName}`)
      .download();
    if (file[0]) {
      console.log('image buffer: ', file[0]);
      return file[0];
    }
    throw Error('Something is wrong while getting image from storage');
  } catch (error) {
    console.error(error);
    throw new Error('cannot get image');
  }
};

export {getImageFromStorage};

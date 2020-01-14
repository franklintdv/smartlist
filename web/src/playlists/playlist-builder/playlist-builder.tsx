import * as React from 'react';
import { Formik, FormikProps } from 'formik';

import { PlaylistBuilderForm } from './playlist-builder-form';
import { PlaylistBuilderFormValues } from './models';
import './playlist-builder.scss';
import { Playlist } from '../models/playlist';
import { baseRequestUrl, requests } from '../../core/requests/requests';

export class PlaylistBuilder extends React.Component {
    render() {
        return (
            <Formik
                initialValues={{
                    title: ''
                }}
                onSubmit={this.onSubmit}
                render={(formikProps: FormikProps<PlaylistBuilderFormValues>) => (
                    <PlaylistBuilderForm
                        formik={formikProps}
                    />
                )}
            />
        );
    }

    private onSubmit = async (values: PlaylistBuilderFormValues) => {
        console.log('in onSubmit');
        console.log(values);

        const playlist = this.mapPlaylistBuilderFormValuesToPlaylist(values);

        await requests.post(`${baseRequestUrl}/playlists/`, playlist);
    }

    private mapPlaylistBuilderFormValuesToPlaylist(values: PlaylistBuilderFormValues): Playlist {
        return {
            title: values.title
        };
    }
}